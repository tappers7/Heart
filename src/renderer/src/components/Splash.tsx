import animationMark from '../assets/animation.png'
import { useI18n } from '../i18n'

export function Splash({ visible }: { visible: boolean }) {
  const { t } = useI18n()
  return (
    <div className={`splash${visible ? '' : ' hide'}`}>
      <img src={animationMark} alt="HEART" />
      <div className="splash-label">{t.splash.loading}</div>
    </div>
  )
}
