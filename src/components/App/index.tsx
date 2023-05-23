import { h, FunctionalComponent, Fragment } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import styles from './styles.scss';

const defaultDebt = 25000;
const defaultChange = 7.1; // June 2023

const stringToNumber = (str: string) => {
  str = str.replace(/[^\d\.\-]/g, '');
  str = str.replace(/-/g, (match, offset: number) => offset === 0 ? '-' : ''); // leave minus in first position, delete otherwise
  let foundDecimal = false;
  // allow first decimal point, delete otherwise
  str = str.replace(/\./g, () => {
    if (!foundDecimal) {
      foundDecimal = true;
      return '.';
    }
    return '';
  });
  let num = +str;
  return isFinite(num) ? num : 0;
};

const formatNumber = (num?: number | string, decimalPlaces = 1): string => {
  return (+(num || 0)).toFixed(decimalPlaces);
}

const formatIntegerWithThousands = (num?: number | string): string => {
  if (!num) {
    return '';
  }
  if (typeof num === 'number') {
    num = num.toFixed(0);
  }
  if (num.length <= 3) {
    return num;
  }
  num = num.replace(/[^\d]+/g, '').replace(/^0+/, '');
  let thousands: string[] = [];
  for (let i=num.length; i>0; i-=3) {
    thousands.unshift(num.substring(i-3, i));
  }
  let text = thousands.join(',');
  return text;
};

const isIframe = (window.self !== window.top);
const isApp = (isIframe ? document.referrer : document.location.href).indexOf('newsapp') !== -1;
const isDarkThemePreferred = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export type AppProps = {
  debt?: string,
  change?: string,
  theme?: string,
}

const App: FunctionalComponent<AppProps> = (props) => {
  let [isDarkTheme, setIsDarkTheme] = useState((isDarkThemePreferred() && isApp) || props.theme === 'dark');
  let containerHeight: number | undefined = undefined;
  let containerRef = useRef<HTMLDivElement | null>(null);
  let [id] = useState<string>(Date.now().toString());
  let [debt, setDebt] = useState<string>(formatIntegerWithThousands(props.debt || defaultDebt));
  let [change, setChange] = useState<string>(formatNumber(props.change || defaultChange));
  let [debtIncrease, setDebtIncrease] = useState(0);
  let [newDebt, setNewDebt] = useState(0);
  let videoElement = useRef<HTMLVideoElement>();
  let videoIntersectionObserver = useRef<IntersectionObserver>();
  let playAnimation = () => {
    if (videoElement.current) {
      videoElement.current.play();
    }
  };
  let initAnimation = () => {
    if (videoElement.current && !videoIntersectionObserver.current) {
      // Play on click/tap/enter
      videoElement.current.addEventListener('mousedown', playAnimation);
      videoElement.current.addEventListener('touchstart', playAnimation);
      document.addEventListener('keydown', (evt: KeyboardEvent) => {
        if (evt.key === 'Enter') {
          playAnimation();
        }
      });
      // Play when in viewport
      videoIntersectionObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio >= 0.9) {
          playAnimation();
        }
      }, { threshold: [0.9] });
      // Rewind at end
      videoElement.current.addEventListener('ended', () => {
        if (videoElement.current) {
          videoElement.current.currentTime = 0;
        }
      });
      videoIntersectionObserver.current.observe(videoElement.current);
    }
  };
  useEffect(initAnimation, [videoElement.current]);
  useEffect(() => {
    let oldDebtNum = stringToNumber(debt);
    let pctChangeNum = stringToNumber(change);
    let newDebtNum = oldDebtNum * (1 + (pctChangeNum / 100));
    let difference = newDebtNum - oldDebtNum;
    setNewDebt(newDebtNum);
    setDebtIncrease(difference);
  }, [debt, change]);
  let onDebtFocus = (evt: Event) => {
    if (!(evt.target instanceof HTMLInputElement)) return;
    evt.target.setSelectionRange(0, evt.target.value.length);
  };
  let onDebtInput = (evt: Event) => {
    if (!(evt.target instanceof HTMLInputElement)) return;
    let debtNum = Math.min(stringToNumber(evt.target.value), 10000000);
    let debt = formatIntegerWithThousands(debtNum);
    setDebt(debt);
  };
  // set theme
  let updateBodyElement = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateBodyElement); // try again when ready
    }
    else {
      document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    }
  };
  useEffect(updateBodyElement, [isDarkTheme]);
  let watchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  if (watchMedia.addEventListener) {
    watchMedia.addEventListener('change', e => {
      setIsDarkTheme((isApp && e.matches) || props.theme === 'dark');
    });
  }
  // set iframe height
  let updateSizeDebounce: number | undefined = undefined;
  let updateSize = () => {
    if (updateSizeDebounce) {
      return;
    }
    updateSizeDebounce = window.setTimeout(() => {
      updateSizeDebounce = undefined;
      if (containerRef.current instanceof HTMLElement) {
        let newContainerHeight = Math.ceil(containerRef.current.scrollHeight) + 16;
        if (containerHeight !== newContainerHeight) {
          containerHeight = newContainerHeight;
          if (isIframe) {
            window.parent.postMessage({ sentinel: 'amp', type: 'embed-size', height: newContainerHeight }, '*'); // notify parent page (AMP compatible)
          }
        }
      }
    }, 100);
  };
  useEffect(updateSize, []);
  window.addEventListener('resize', updateSize);
  window.addEventListener('orientationchange', updateSize);
  return (
    <div className={styles['hecs-help-debt-calculator']} data-theme={isDarkTheme ? 'dark' : 'light'} ref={containerRef}>
      <header>
        <div class="illustration" role="presentation">
          <video ref={videoElement} width="100" height="100" autoplay playsInline muted poster="https://www.abc.net.au/res/sites/news-projects/hecs-help-debt-calculator/animation/graduation-cap.png" title='Credit: "Graduation-cap" by The Noto Project Authors is licensed under CC BY 4.0'>
            <source src="https://www.abc.net.au/res/sites/news-projects/hecs-help-debt-calculator/animation/graduation-cap.webm" codecs="video/webm; codecs=vp9" />
            <source src="https://www.abc.net.au/res/sites/news-projects/hecs-help-debt-calculator/animation/graduation-cap.mp4" codecs="video/mp4; codecs=hvc" />
          </video>
        </div>
        <h2>What will your HECS/HELP debt <span>increase to?</span></h2>
      </header>
      <main>
        <form>
          <p class="debt">
            <label for={`debt-${id}`}>Your current debt:</label>
            {' '}
            <span><label>$</label><input id={`debt-${id}`} type="text" inputmode="decimal" name="debt" value={debt} maxlength="10" onFocus={onDebtFocus} onInput={onDebtInput} /></span>
          </p>
        </form>
      </main>
      <footer>
        <p class="output" aria-live="polite">
          { debtIncrease > 0
            ? <Fragment>Your debt will increase <span>by <strong>${formatIntegerWithThousands(Math.round(debtIncrease)) || 0}</strong></span> <span>to <strong>${formatIntegerWithThousands(Math.round(newDebt)) || 0}</strong>.</span> </Fragment>
            : <Fragment>Your debt will remain unchanged <span>at <strong>${formatIntegerWithThousands(Math.round(newDebt)) || 0}</strong>.</span></Fragment>
          }
        </p>
        <p class="fineprint">This calculation is an estimate only, and assumes a HECS/HELP debt <span>increase of {change} percent.</span></p>
      </footer>
    </div>
  );
};

export default App;
