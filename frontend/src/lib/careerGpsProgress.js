/**
 * Career GPS progress + activation event helpers.
 * Progress is local for now. Activation events are queued for phase-2 email triggers.
 */
import {
  ROADMAP_PROGRESS_KEY,
  ACTIVATION_QUEUE_KEY,
} from "../data/career_gps_config";

export function progressStorageKey(role) {
  return `${ROADMAP_PROGRESS_KEY}::${role || "default"}`;
}

export function loadProgress(role) {
  try {
    return JSON.parse(localStorage.getItem(progressStorageKey(role)) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(role, done) {
  try {
    localStorage.setItem(progressStorageKey(role), JSON.stringify(done));
  } catch {
    /* noop */
  }
}

/** Task id: `w{week}-t{index}` */
export function taskId(week, taskIndex) {
  return `w${week}-t${taskIndex}`;
}

export function weekMilestoneId(week) {
  return `w${week}-milestone`;
}

/**
 * Queue an activation event for future email triggers
 * (e.g. roadmap_opened, task_completed, week_complete, halfway, completed).
 * Phase 2: POST /api/career-gps/activation → Resend/SendGrid.
 */
export function trackActivationEvent(type, payload = {}) {
  try {
    const raw = localStorage.getItem(ACTIVATION_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      type,
      payload,
      at: new Date().toISOString(),
    });
    localStorage.setItem(ACTIVATION_QUEUE_KEY, JSON.stringify(queue.slice(-100)));
  } catch {
    /* noop */
  }
}

export function summarizeProgress(roadmap, done) {
  let totalTasks = 0;
  let doneTasks = 0;
  const weeks = (roadmap || []).map((w) => {
    const tasks = Array.isArray(w.tasks) && w.tasks.length
      ? w.tasks
      : [w.milestone].filter(Boolean);
    const ids = tasks.map((_, i) => taskId(w.week, i));
    const completed = ids.filter((id) => done[id]).length;
    totalTasks += ids.length;
    doneTasks += completed;
    return {
      week: w.week,
      total: ids.length,
      completed,
      ratio: ids.length ? completed / ids.length : 0,
    };
  });
  const percent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  return { weeks, totalTasks, doneTasks, percent };
}
