"use client";

import { useEffect, useState } from "react";

import type { CoachEvent, CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { CoverImageField } from "@/components/media/cover-image-field";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { photography } from "@/config/photography";
import {
  fetchAuthedCoachProfile,
  saveCoachPackagesEvents,
} from "@/lib/api/practice";
import { MAX_COACH_EVENTS } from "@/lib/coach/events";
import { COACH_EVENT_IMAGE_DOC_TYPE } from "@/types/document";

function emptyEvent(): CoachEvent {
  return {
    id: `evt_${Date.now()}`,
    title: "",
    date: "",
    time: "",
    location: "",
    link: "",
  };
}

function savableEvents(list: CoachEvent[]): CoachEvent[] {
  return list
    .map((evt) => ({
      ...evt,
      title: evt.title.trim(),
      date: evt.date.trim(),
      time: evt.time.trim(),
      location: evt.location.trim(),
      link: evt.link.trim(),
      imageUrl: evt.imageUrl?.trim() || undefined,
    }))
    .filter((evt) => evt.title);
}

function eventsKey(list: CoachEvent[]) {
  return JSON.stringify(
    savableEvents(list).map((evt) => ({
      title: evt.title,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      link: evt.link,
      imageUrl: evt.imageUrl ?? "",
    })),
  );
}

export function EventsListView() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [events, setEvents] = useState<CoachEvent[]>([]);
  const [baseline, setBaseline] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const dirty = !loading && !!profile && eventsKey(events) !== baseline;

  useEffect(() => {
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((p) => {
        if (cancelled || !p) return;
        setProfile(p);
        const next = p.events ?? [];
        setEvents(next);
        setBaseline(eventsKey(next));
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load events.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.coachId]);

  function edit(updater: (prev: CoachEvent[]) => CoachEvent[]) {
    setMessage(null);
    setEvents(updater);
  }

  async function save() {
    if (!profile || !dirty) return;
    const cleaned = savableEvents(events);
    if (eventsKey(cleaned) === baseline) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await saveCoachPackagesEvents({ profile, events: cleaned });
      setEvents(cleaned);
      setBaseline(eventsKey(cleaned));
      setMessage("Events saved. Upcoming ones show on your public profile.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save events.");
    } finally {
      setBusy(false);
    }
  }

  function addEvent() {
    if (events.length >= MAX_COACH_EVENTS) return;
    edit((prev) => [...prev, emptyEvent()]);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PracticePageHeader
        title="Events"
        description={`Up to ${MAX_COACH_EVENTS} events for your public showcase.`}
        action={
          dirty ?
            <button
              type="button"
              className="mc-btn-primary"
              disabled={busy}
              aria-busy={busy}
              onClick={() => void save()}
            >
              {busy ? "Saving" : "Save events"}
            </button>
          : null
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {loading ?
        <PracticeRosterSkeleton rows={3} />
      : !events.length ?
        <PracticeEmpty
          image={photography.emptyEvents}
          imageAlt="Three people stretching together in a park"
          title="No events yet"
          body="Add workshops or community sessions for your public page."
          action={
            <button type="button" className="mc-btn-primary" onClick={addEvent}>
              Add event
            </button>
          }
        />
      : null}

      <div className="space-y-4">
        {events.map((evt) => (
          <div key={evt.id} className="mc-panel p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-bold text-ink">
                {evt.title.trim() || "New event"}
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-[color:var(--mc-destructive)]"
                onClick={() =>
                  edit((prev) => prev.filter((e) => e.id !== evt.id))
                }
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {session?.coachCode ?
                <CoverImageField
                  imageUrl={evt.imageUrl}
                  coachCode={session.coachCode}
                  savedBy={session.coachId}
                  docType={COACH_EVENT_IMAGE_DOC_TYPE}
                  disabled={busy}
                  onError={setError}
                  onChange={(imageUrl) =>
                    edit((prev) =>
                      prev.map((row) =>
                        row.id === evt.id ?
                          { ...row, imageUrl: imageUrl || undefined }
                        : row,
                      ),
                    )
                  }
                />
              : null}
              <TextField
                label="Title"
                value={evt.title}
                onChange={(e) =>
                  edit((prev) =>
                    prev.map((row) =>
                      row.id === evt.id ?
                        { ...row, title: e.target.value }
                      : row,
                    ),
                  )
                }
              />
              <TextField
                label="Date"
                value={evt.date}
                placeholder="YYYY-MM-DD"
                onChange={(e) =>
                  edit((prev) =>
                    prev.map((row) =>
                      row.id === evt.id ?
                        { ...row, date: e.target.value }
                      : row,
                    ),
                  )
                }
              />
              <TextField
                label="Time"
                value={evt.time}
                onChange={(e) =>
                  edit((prev) =>
                    prev.map((row) =>
                      row.id === evt.id ?
                        { ...row, time: e.target.value }
                      : row,
                    ),
                  )
                }
              />
              <TextField
                label="Location"
                value={evt.location}
                onChange={(e) =>
                  edit((prev) =>
                    prev.map((row) =>
                      row.id === evt.id ?
                        { ...row, location: e.target.value }
                      : row,
                    ),
                  )
                }
              />
              <TextField
                label="Link"
                value={evt.link}
                className="sm:col-span-2"
                onChange={(e) =>
                  edit((prev) =>
                    prev.map((row) =>
                      row.id === evt.id ?
                        { ...row, link: e.target.value }
                      : row,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      {!loading && events.length > 0 && events.length < MAX_COACH_EVENTS ?
        <button
          type="button"
          className="mc-btn-secondary mt-4"
          onClick={addEvent}
        >
          Add event
        </button>
      : null}
    </div>
  );
}
