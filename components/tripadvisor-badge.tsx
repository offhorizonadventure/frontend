import Script from "next/script";

/**
 * TripAdvisor Travellers' Choice badge.
 *
 * TripAdvisor's own widget: the script replaces the contents of the div it is
 * given, matched by the `uniq` in its URL. That id has to stay in step with
 * the div's, and the widget only renders once per page, so this belongs in
 * the footer and nowhere else.
 *
 * `lazyOnload` keeps a third-party script off the critical path. The anchor
 * and image below are the widget's own fallback: if the script is blocked, or
 * has not run yet, the badge still shows and still links to the reviews
 * rather than leaving a blank gap.
 */
export function TripAdvisorBadge() {
  return (
    <>
      <div
        id="TA_certificateOfExcellence894"
        className="TA_certificateOfExcellence"
      >
        <ul id="zigsEc8x" className="TA_links i9CYxd9gMj">
          <li id="ZkHStUZrno" className="E6ne23f5">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.tripadvisor.in/Attraction_Review-g2287432-d17234206-Reviews-Bikerentalsbhuntar-Bhuntar_Kullu_District_Himachal_Pradesh.html"
            >
              {/* Left as a plain img on purpose: next/image would need
                  static.tacdn.com added to remotePatterns, and TripAdvisor
                  swaps this element out anyway once the script runs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://static.tacdn.com/img2/travelers_choice/widgets/tchotel_2024_LL.png"
                alt="TripAdvisor Travellers' Choice 2024 award for BRB Expeditions"
                className="widCOEImg"
                id="CDSWIDCOELOGO"
                width={130}
                height={130}
              />
            </a>
          </li>
        </ul>
      </div>
      <Script
        id="tripadvisor-certificate"
        strategy="lazyOnload"
        src="https://www.jscache.com/wejs?wtype=certificateOfExcellence&uniq=894&locationId=17234206&lang=en_IN&year=2024&display_version=2"
        data-loadtrk
      />
    </>
  );
}
