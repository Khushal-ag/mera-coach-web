"use client";

import { useEffect, useState } from "react";

import type { CoachEvent, CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { ListEmpty } from "@/components/list-empty";
import { CoverImageField } from "@/components/media/cover-image-field";
import { PracticePageHeader } from "@/components/practice/page-header";
import { SummaryCard } from "@/components/practice/views/summary-card";
import { EventCardsSkeleton } from "@/components/skeletons/packages-events-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { MAX_COACH_EVENTS } from "@/constants/coach";
import { COACH_EVENT_IMAGE_DOC_TYPE } from "@/constants/documents";
import {
  fetchAuthedCoachProfile,
  saveCoachPackagesEvents,
} from "@/lib/api/practice";

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

function formatEventDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value.trim();
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function eventLines(evt: CoachEvent) {
  const when = [formatEventDate(evt.date), evt.time.trim()]
    .filter(Boolean)
    .join(" · ");
  const place = evt.location.trim();
  return [
    ...(when ? [{ icon: "fas fa-clock", text: when }] : []),
    ...(place ? [{ icon: "fas fa-map-marker-alt", text: place }] : []),
  ];
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
  const [editingId, setEditingId] = useState<string | null>(null);
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

  function patch(id: string, change: Partial<CoachEvent>) {
    edit((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...change } : row)),
    );
  }

  function remove(id: string) {
    edit((prev) => prev.filter((row) => row.id !== id));
    setEditingId((current) => (current === id ? null : current));
  }

  /** Close the editor; a card that never got a title is dropped. */
  function finishEditing(evt: CoachEvent) {
    if (!evt.title.trim()) remove(evt.id);
    else setEditingId(null);
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
      setEditingId(null);
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
    const row = emptyEvent();
    edit((prev) => [...prev, row]);
    setEditingId(row.id);
  }

  const canAdd = !loading && events.length < MAX_COACH_EVENTS;

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Events"
        description={`Up to ${MAX_COACH_EVENTS} events for your public showcase.`}
        icon={
          <i
            className="fas fa-calendar-alt"
            style={{ fontSize: 20 }}
            aria-hidden
          />
        }
        action={
          (canAdd && events.length > 0) || dirty ?
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              {canAdd && events.length > 0 ?
                <button
                  type="button"
                  className={
                    dirty ?
                      "mc-btn-secondary w-full sm:w-auto"
                    : "mc-btn-primary w-full sm:w-auto"
                  }
                  onClick={addEvent}
                >
                  Add event
                </button>
              : null}
              {dirty ?
                <button
                  type="button"
                  className="mc-btn-primary w-full sm:w-auto"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => void save()}
                >
                  {busy ? "Saving" : "Save events"}
                </button>
              : null}
            </div>
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
        <EventCardsSkeleton />
      : !events.length ?
        <ListEmpty
          icon="fas fa-calendar-alt"
          title="No events yet"
          action={
            <button
              type="button"
              className="clt-btn clt-btn-primary"
              onClick={addEvent}
            >
              Add event
            </button>
          }
        />
      : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((evt) =>
          editingId !== evt.id ?
            <SummaryCard
              key={evt.id}
              title={evt.title}
              icon="fas fa-calendar-alt"
              imageUrl={evt.imageUrl}
              lines={eventLines(evt)}
              editLabel="Edit event"
              onEdit={() => setEditingId(evt.id)}
              onRemove={() => remove(evt.id)}
            />
          : <div key={evt.id} className="clt-card col-span-full min-w-0">
              <div className="clt-card-header">
                <h2>
                  <i className="fas fa-calendar-alt" />{" "}
                  {evt.title.trim() || "New event"}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="clt-total-badge"
                    onClick={() => remove(evt.id)}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="clt-total-badge"
                    onClick={() => finishEditing(evt)}
                  >
                    Done
                  </button>
                </div>
              </div>
              <div className="clt-card-body grid gap-3 sm:grid-cols-2">
                {session?.coachCode ?
                  <CoverImageField
                    imageUrl={evt.imageUrl}
                    coachCode={session.coachCode}
                    savedBy={session.coachId}
                    docType={COACH_EVENT_IMAGE_DOC_TYPE}
                    disabled={busy}
                    onError={setError}
                    onChange={(imageUrl) =>
                      patch(evt.id, { imageUrl: imageUrl || undefined })
                    }
                  />
                : null}
                <TextField
                  label="Title"
                  value={evt.title}
                  onChange={(e) => patch(evt.id, { title: e.target.value })}
                />
                <TextField
                  label="Date"
                  type="date"
                  value={evt.date}
                  onChange={(e) => patch(evt.id, { date: e.target.value })}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={evt.time}
                  onChange={(e) => patch(evt.id, { time: e.target.value })}
                />
                <TextField
                  label="Location"
                  value={evt.location}
                  onChange={(e) => patch(evt.id, { location: e.target.value })}
                />
                <TextField
                  label="Link"
                  value={evt.link}
                  className="sm:col-span-2"
                  onChange={(e) => patch(evt.id, { link: e.target.value })}
                />
              </div>
            </div>,
        )}
      </div>
    </div>
  );
}
