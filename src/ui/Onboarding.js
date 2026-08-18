/**
 * Onboarding.js — teach one mechanic at a time, gated on doing it.
 *
 * Every step is a single instruction and a condition that only the player's own
 * action can satisfy. Nothing advances on a timer, because a timer teaches
 * nothing: it just moves text along whether or not anyone understood it. The
 * sequence is short by design — four steps covering aim, power, chaining and
 * the exit — and it never blocks play, so a returning player simply does the
 * things and watches it tick past.
 *
 * Completion is remembered, and the main menu can clear that flag to replay it.
 */

const KEY = 'billiard-tutorial-done-v1';

/**
 * Each step: a label, the line shown, and the event that satisfies it.
 * `on` is matched against the event name; `when` further filters the payload.
 */
export const STEPS = [
  {
    id: 'aim',
    label: 'Step 1 of 3',
    say: 'Drag down to aim',
    // Satisfied by a real draw, so the cue is already in hand and the line is
    // on screen before the next instruction arrives.
    on: 'aiming',
    when: (e) => e.draw >= 2.6,
    done: 'That is your cue'
  },
  {
    id: 'fire',
    label: 'Step 2 of 3',
    say: 'Release to shoot',
    on: 'launch'
  },
  {
    id: 'chain',
    label: 'Step 3 of 3',
    say: 'Hit 2 in a row',
    on: 'hits',
    when: (e) => e.count >= 2,
    done: 'Chain \u00d71.4'
  }
];

export class Onboarding {
  /** @param {HTMLElement} layer the `#ui-layer` element */
  constructor(layer) {
    this.el = document.createElement('div');
    this.el.id = 'coach';
    this.stepEl = document.createElement('div');
    this.stepEl.className = 'step';
    this.sayEl = document.createElement('div');
    this.sayEl.className = 'say';
    this.el.append(this.stepEl, this.sayEl);
    layer.appendChild(this.el);

    this.index = -1;
    this.active = false;
    this._clearTimer = 0;
    /** True while a completed step is showing its confirmation. */
    this._confirming = false;
    /** Events that arrived mid-confirmation, replayed against the next step. */
    this._pending = [];
  }

  static get completed() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }

  static markComplete() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* private mode — the tutorial simply runs again next time */
    }
  }

  static reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* no-op */
    }
  }

  /** Begin at step one. Safe to call repeatedly. */
  start() {
    this.active = true;
    this.index = 0;
    this._confirming = false;
    this._pending.length = 0;
    this._show();
  }

  stop() {
    this.active = false;
    this.index = -1;
    this._confirming = false;
    this._pending.length = 0;
    clearTimeout(this._clearTimer);
    this.el.classList.remove('show', 'done');
  }

  get current() {
    return this.active ? STEPS[this.index] : null;
  }

  _show() {
    const step = this.current;
    if (!step) {
      this.el.classList.remove('show', 'done');
      return;
    }
    this.el.classList.remove('done');
    this.stepEl.textContent = step.label;
    this.sayEl.textContent = step.say;
    this.el.classList.add('show');
  }

  /**
   * Report something the player did. Advances only if it satisfies the step
   * currently on screen.
   *
   * @param {string} name event name
   * @param {object} [payload]
   */
  notify(name, payload = {}) {
    if (!this.active) return;

    // A player who drags and immediately releases would otherwise lose the
    // release: it lands while step one is still showing its tick, and the next
    // step appears already stale. Buffer anything that arrives mid-confirmation
    // and replay it once the next step is actually on screen.
    if (this._confirming) {
      this._pending.push({ name, payload });
      return;
    }

    const step = this.current;
    if (!step || step.on !== name) return;
    if (step.when && !step.when(payload)) return;

    // Confirm before moving on, so the player sees that what they just did was
    // what was being asked of them.
    this.stepEl.textContent = step.done || 'Done';
    this.el.classList.add('done');
    this._confirming = true;

    clearTimeout(this._clearTimer);
    this._clearTimer = setTimeout(() => {
      this._confirming = false;
      this.index += 1;

      if (this.index >= STEPS.length) {
        this.active = false;
        this._pending.length = 0;
        this.stepEl.textContent = 'Tutorial complete';
        this.sayEl.textContent = 'Go break some racks';
        Onboarding.markComplete();
        clearTimeout(this._clearTimer);
        this._clearTimer = setTimeout(() => this.el.classList.remove('show', 'done'), 2000);
        return;
      }

      this._show();
      const queued = this._pending.splice(0, this._pending.length);
      for (const q of queued) this.notify(q.name, q.payload);
    }, 620);
  }

  dispose() {
    clearTimeout(this._clearTimer);
    this.el.remove();
  }
}

export default Onboarding;
