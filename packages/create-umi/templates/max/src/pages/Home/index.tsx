import Guide from "@/components/Guide"
import Page from "@/components/Page"
import { useModel } from "@sortinox/umi-max"

const HomePage: React.FC = () => {
  const { name } = useModel("global")
  return (
    <Page pageTitle="Home">
      <Guide name={name} />
    </Page>
  )
}

export default HomePage
