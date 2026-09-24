import json
import os
import threading
import time
import math
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="evaad", version="0.5.0", description="A balance-first debate space")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Storage ──
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "drishti.json")
_lock = threading.Lock()


def _ensure_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DATA_FILE):
        return
    now = datetime.now(timezone.utc).isoformat()
    yesterday = (datetime.now(timezone.utc) - timedelta(hours=20)).isoformat()
    last_week = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()

    seed = {
        "topics": [
            {
                "id": 1,
                "title": "Should social media be regulated by the government?",
                "genre": "Politics",
                "region": "India",
                "created_at": now,
                "views": 142,
                "arguments": [
                    {
                        "id": 1, "side": "for",
                        "body": "India's IT Rules 2021 already require platforms to appoint grievance officers and remove unlawful content within 36 hours. Government oversight prevents the spread of fake news and hate speech that can incite communal violence.",
                        "created_at": yesterday, "liked_by": ["dev-abc123-1699999999999", "dev-xyz789-1700000000000", "dev-sample-1700100000000"]
                    },
                    {
                        "id": 2, "side": "for",
                        "body": "Section 69A of the IT Act gives the government power to block content in the interest of sovereignty and integrity of India. This is necessary because foreign platforms often ignore Indian court orders.",
                        "created_at": last_week, "liked_by": ["dev-abc123-1699999999999"]
                    },
                    {
                        "id": 3, "side": "against",
                        "body": "The Supreme Court in Shreya Singhal v. Union of India struck down Section 66A precisely because vague regulation chills free speech. Government control often becomes a tool to silence dissent rather than prevent genuine harm.",
                        "created_at": now, "liked_by": ["dev-xyz789-1700000000000", "dev-sample-1700100000000", "dev-anon-1700200000000", "dev-test-1700300000000"]
                    },
                    {
                        "id": 4, "side": "against",
                        "body": "When governments regulate speech, they inevitably overreach. Look at how the Emergency-era censorship was used to suppress opposition voices. Self-regulation with judicial oversight is far safer.",
                        "created_at": yesterday, "liked_by": ["dev-abc123-1699999999999", "dev-xyz789-1700000000000"]
                    }
                ]
            },
            {
                "id": 2,
                "title": "Is online education as effective as in-person schooling?",
                "genre": "Education",
                "region": "India",
                "created_at": yesterday,
                "views": 89,
                "arguments": [
                    {
                        "id": 1, "side": "for",
                        "body": "Online education democratizes access. A student in a remote village in Bihar can now attend the same lectures as someone in Delhi. Platforms like SWAYAM and NPTEL have proven this model works at scale.",
                        "created_at": yesterday, "liked_by": ["dev-abc123-1699999999999", "dev-sample-1700100000000"]
                    },
                    {
                        "id": 2, "side": "against",
                        "body": "Digital divide is real. Only 43% of Indian households have internet access. Online education widens the gap between urban elite and rural poor, and lacks the social-emotional learning that happens in physical classrooms.",
                        "created_at": yesterday, "liked_by": ["dev-xyz789-1700000000000", "dev-anon-1700200000000", "dev-test-1700300000000"]
                    }
                ]
            },
            {
                "id": 3,
                "title": "Should India adopt a uniform civil code?",
                "genre": "Politics",
                "region": "India",
                "created_at": last_week,
                "views": 256,
                "arguments": [
                    {
                        "id": 1, "side": "for",
                        "body": "Article 44 of the Constitution itself directs the State to secure a Uniform Civil Code. Personal laws based on religion often discriminate against women — triple talaq and unequal inheritance rights are clear examples.",
                        "created_at": last_week, "liked_by": ["dev-abc123-1699999999999", "dev-xyz789-1700000000000", "dev-sample-1700100000000", "dev-anon-1700200000000"]
                    },
                    {
                        "id": 2, "side": "against",
                        "body": "India's strength is its diversity. Imposing a uniform code ignores the cultural and religious contexts that personal laws accommodate. It could be seen as majoritarian imposition and threaten social harmony.",
                        "created_at": last_week, "liked_by": ["dev-test-1700300000000"]
                    }
                ]
            },
            {
                "id": 4,
                "title": "Is AI art generation ethical?",
                "genre": "Tech",
                "region": "Global",
                "created_at": now,
                "views": 67,
                "arguments": []
            },
            {
                "id": 5,
                "title": "Should cricket remain India's unofficial national sport?",
                "genre": "Sports",
                "region": "India",
                "created_at": yesterday,
                "views": 198,
                "arguments": []
            }
        ]
    }
    _atomic_write(seed)


def _atomic_write(data: dict):
    tmp = DATA_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, DATA_FILE)


def _load() -> dict:
    _ensure_data()
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict):
    with _lock:
        _atomic_write(data)


def _next_id(items: list) -> int:
    return max((i["id"] for i in items), default=0) + 1


# ── Endpoints ──

@app.get("/")
def root():
    return {
        "app": "evaad",
        "version": "0.5.0",
        "tagline": "See both sides. | दोनों पक्ष देखें।",
        "docs": "/docs"
    }


@app.get("/meta")
def meta():
    return {
        "genres": ["Politics", "Tech", "Education", "Society",
                   "Economy", "Culture", "Sports", "Science", "Other"],
        "regions": ["India", "South Asia", "Asia", "Global"]
    }


@app.get("/topics")
def list_topics(
    genre: Optional[str] = None,
    region: Optional[str] = None,
    sort: Optional[str] = Query("hot", pattern="^(hot|new|top|controversial)$")
):
    data = _load()
    topics = data["topics"]
    if genre:
        topics = [t for t in topics if t["genre"] == genre]
    if region:
        topics = [t for t in topics if t["region"] == region]

    scored = []
    for t in topics:
        total_likes = sum(len(a["liked_by"]) for a in t["arguments"])
        num_args = len(t["arguments"])
        for_count = sum(1 for a in t["arguments"] if a["side"] == "for")
        against_count = num_args - for_count
        age_hours = (datetime.now(timezone.utc) - datetime.fromisoformat(t["created_at"])).total_seconds() / 3600

        if sort == "hot":
            score = math.log10(total_likes + 1) + max(0, 6 - age_hours) + 4.0 / (1 + num_args / 5.0)
        elif sort == "new":
            score = -age_hours
        elif sort == "top":
            score = total_likes
        else:  # controversial
            score = -abs(for_count - against_count) + num_args * 0.5

        scored.append((score, t, total_likes, for_count, against_count))

    scored.sort(key=lambda x: x[0], reverse=(sort != "new"))
    return {
        "topics": [
            {
                "id": t["id"],
                "title": t["title"],
                "genre": t["genre"],
                "region": t["region"],
                "created_at": t["created_at"],
                "views": t.get("views", 0),
                "total_likes": tl,
                "for_count": fc,
                "against_count": ac,
                "arguments": [
                    {"id": a["id"], "side": a["side"], "body": a["body"],
                     "created_at": a["created_at"], "like_count": len(a["liked_by"])}
                    for a in t["arguments"]
                ]
            }
            for _, t, tl, fc, ac in scored
        ]
    }


class NewTopic(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    genre: str
    region: str


@app.post("/topics")
def create_topic(body: NewTopic):
    meta_data = meta()
    if body.genre not in meta_data["genres"]:
        raise HTTPException(status_code=400, detail="Invalid genre")
    if body.region not in meta_data["regions"]:
        raise HTTPException(status_code=400, detail="Invalid region")
    data = _load()
    topic = {
        "id": _next_id(data["topics"]),
        "title": body.title,
        "genre": body.genre,
        "region": body.region,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "views": 0,
        "arguments": []
    }
    data["topics"].append(topic)
    _save(data)
    return topic


@app.get("/topics/{topic_id}")
def get_topic(topic_id: int, x_device_id: Optional[str] = Header(None, alias="X-Device-Id")):
    data = _load()
    for t in data["topics"]:
        if t["id"] == topic_id:
            t["views"] = t.get("views", 0) + 1
            _save(data)

            for_arr = sorted(
                [a for a in t["arguments"] if a["side"] == "for"],
                key=lambda a: (-len(a["liked_by"]), a["created_at"])
            )
            against_arr = sorted(
                [a for a in t["arguments"] if a["side"] == "against"],
                key=lambda a: (-len(a["liked_by"]), a["created_at"])
            )
            return {
                "id": t["id"],
                "title": t["title"],
                "genre": t["genre"],
                "region": t["region"],
                "created_at": t["created_at"],
                "views": t["views"],
                "balanced": {
                    "for_count": len(for_arr),
                    "against_count": len(against_arr),
                    "for": [
                        {"id": a["id"], "side": a["side"], "body": a["body"],
                         "created_at": a["created_at"], "like_count": len(a["liked_by"]),
                         "liked_by_me": x_device_id in a["liked_by"]}
                        for a in for_arr
                    ],
                    "against": [
                        {"id": a["id"], "side": a["side"], "body": a["body"],
                         "created_at": a["created_at"], "like_count": len(a["liked_by"]),
                         "liked_by_me": x_device_id in a["liked_by"]}
                        for a in against_arr
                    ]
                }
            }
    raise HTTPException(status_code=404, detail="Topic not found")


@app.get("/topics/{topic_id}/stats")
def topic_stats(topic_id: int):
    data = _load()
    for t in data["topics"]:
        if t["id"] == topic_id:
            args = t["arguments"]
            for_likes = sum(len(a["liked_by"]) for a in args if a["side"] == "for")
            against_likes = sum(len(a["liked_by"]) for a in args if a["side"] == "against")
            total = for_likes + against_likes
            return {
                "for_likes": for_likes,
                "against_likes": against_likes,
                "total_likes": total,
                "for_pct": round(for_likes / total * 100, 1) if total else 50,
                "against_pct": round(against_likes / total * 100, 1) if total else 50,
                "for_count": sum(1 for a in args if a["side"] == "for"),
                "against_count": sum(1 for a in args if a["side"] == "against"),
                "views": t.get("views", 0)
            }
    raise HTTPException(status_code=404, detail="Topic not found")


class NewArgument(BaseModel):
    side: str = Field(..., pattern="^(for|against)$")
    body: str = Field(..., min_length=3, max_length=2000)


@app.post("/topics/{topic_id}/arguments")
def add_argument(topic_id: int, body: NewArgument):
    data = _load()
    for t in data["topics"]:
        if t["id"] == topic_id:
            arg = {
                "id": _next_id(t["arguments"]),
                "side": body.side,
                "body": body.body,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "liked_by": []
            }
            t["arguments"].append(arg)
            _save(data)
            return arg
    raise HTTPException(status_code=404, detail="Topic not found")


@app.post("/topics/{topic_id}/arguments/{arg_id}/like")
def toggle_like(topic_id: int, arg_id: int, x_device_id: str = Header(..., alias="X-Device-Id")):
    data = _load()
    for t in data["topics"]:
        if t["id"] == topic_id:
            for a in t["arguments"]:
                if a["id"] == arg_id:
                    if x_device_id in a["liked_by"]:
                        a["liked_by"].remove(x_device_id)
                    else:
                        a["liked_by"].append(x_device_id)
                    _save(data)
                    return {"id": a["id"], "side": a["side"], "body": a["body"],
                            "created_at": a["created_at"], "like_count": len(a["liked_by"]),
                            "liked_by_me": x_device_id in a["liked_by"]}
            raise HTTPException(status_code=404, detail="Argument not found")
    raise HTTPException(status_code=404, detail="Topic not found")
