interface Props {
  enabled: boolean
}

/** Aviso de «demo en línea»: solo aparece en el despliegue de Vercel (VITE_DEMO_NOTICE=true). */
export default function DemoNotice({ enabled }: Props) {
  if (!enabled) return null
  return (
    <p className="demo-notice" role="note">
      <strong>Demo en línea.</strong> Los datos son de ejemplo y se reinician tras un rato de inactividad. Para una
      instalación que conserva los datos, mira el README (<code>podman compose up</code>).
    </p>
  )
}
