import { Fragment } from "react";

import { StatNumber } from "@/components/home/stat-number";
import { HOME_STATS } from "@/constants/home";

/** The dark strip of headline numbers. Each one counts up when it scrolls into view. */
export function HomeStats() {
  return (
    <section className="trust-strip">
      <div className="container">
        <div className="stats-row">
          {HOME_STATS.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 ?
                <div className="stat-divider" />
              : null}
              <div className="stat-item">
                <StatNumber
                  target={stat.target}
                  unit={stat.unit}
                  inline={"inline" in stat ? stat.inline : undefined}
                  decimals={"decimals" in stat ? stat.decimals : undefined}
                />
                <span className="stat-label">{stat.label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
