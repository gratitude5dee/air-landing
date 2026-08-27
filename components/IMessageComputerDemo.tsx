import { LuBrainCircuit, LuCheck, LuGlobe, LuLockKeyhole, LuSparkles } from "react-icons/lu";

import styles from "./IMessageComputerDemo.module.css";

export function IMessageComputerDemo() {
  return (
    <div className="iphone-shell">
      <div className="iphone-screen">
        <div className="dynamic-island" aria-hidden />
        <div className="ios-status">
          <span>9:41</span>
          <span aria-hidden>● ●● ᯤ ▰</span>
        </div>

        <div className="thread-head">
          <span className="thread-back" aria-hidden>‹</span>
          <span className="thread-avatar" aria-hidden><span className="thread-avatar-letter">A</span></span>
          <span>air by WZRD.tech <small aria-hidden>›</small></span>
        </div>

        <div className={`thread-body ${styles.threadBody}`}>
          <p className="thread-time">Today 9:41</p>
          <div className="phone-message-row you">
            <p className="phone-bubble">Plan the launch from this deck. Build the room and bring back what needs approval.</p>
          </div>
          <div className="phone-message-row air">
            <p className="phone-bubble">Composing your computer around the task.</p>
            <span className={styles.reactionBadge} aria-label="Air acknowledged the request">✦</span>
          </div>

          <article className={`mini-app ${styles.computerCard}`} aria-label="Launch room Mini App ready">
            <header className={styles.cardHeader}>
              <span className={styles.airOrb}><LuSparkles aria-hidden /></span>
              <div><strong>Launch room</strong><small>Mini App · ready</small></div>
              <LuCheck aria-hidden />
            </header>
            <div className={styles.computerStatus}>
              <span><LuBrainCircuit aria-hidden /><b>Memory</b><small>Context loaded</small></span>
              <span><LuGlobe aria-hidden /><b>Browser</b><small>Sources mapped</small></span>
            </div>
            <div className={styles.needsYou}>
              <LuLockKeyhole aria-hidden />
              <span><small>Needs you</small><b>Approve publish</b></span>
              <em>Review</em>
            </div>
          </article>
          <p className={styles.threadNote}>One request · persistent context · approval built in</p>
        </div>
        <div className="message-composer" aria-hidden><span>＋</span><div>iMessage</div><span>⌁</span></div>
      </div>
    </div>
  );
}
