"use client";

import { useEffect, useState } from "react";

import type { CoachEvent, CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { CoverImageField } from "@/components/media/cover-image-field";
import {
  PracticeEmpty,
  PracticePageHeader,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
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

export default function EventsPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [events, setEvents] = useState<CoachEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((p) => {
        if (cancelled || !p) return;
        setProfile(p);
        setEvents(p.events ?? []);
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

  async function save() {
    if (!profile) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const cleaned = events
        .map((e) => ({
          ...e,
          title: e.title.trim(),
          date: e.date.trim(),
          time: e.time.trim(),
          location: e.location.trim(),
          link: e.link.trim(),
          imageUrl: e.imageUrl?.trim() || undefined,
        }))
        .filter((e) => e.title);
      await saveCoachPackagesEvents({ profile, events: cleaned });
      setEvents(cleaned);
      setMessage("Events saved. Upcoming ones show on your public profile.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save events.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PracticePageHeader
        title="Events"
        description={`Up to ${MAX_COACH_EVENTS} events for your public showcase.`}
        action={
          <button
            type="button"
            className="mc-btn-primary"
            disabled={busy || loading || !profile}
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save events"}
          </button>
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {loading ?
        <p className="text-sm text-ink-muted">Loading events…</p>
      : !events.length ?
        <PracticeEmpty
          title="No events yet"
          body="Add workshops or community sessions for your public page."
        />
      : null}

      <div className="space-y-4">
        {events.map((evt, index) => (
          <div
            key={evt.id}
            className="rounded-[var(--radius-md)] border border-line bg-surface p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-bold text-ink">
                Event {index + 1}
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-[color:var(--mc-destructive)]"
                onClick={() =>
                  setEvents((prev) => prev.filter((e) => e.id !== evt.id))
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
                    setEvents((prev) =>
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
                  setEvents((prev) =>
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
                  setEvents((prev) =>
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
                  setEvents((prev) =>
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
                  setEvents((prev) =>
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
                  setEvents((prev) =>
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

      {events.length < MAX_COACH_EVENTS ?
        <button
          type="button"
          className="mc-btn-secondary mt-4"
          onClick={() => setEvents((prev) => [...prev, emptyEvent()])}
        >
          Add event
        </button>
      : null}
    </div>
  );
}
