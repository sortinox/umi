import Page from "@/components/Page"
import { Access, useAccess } from "@sortinox/umi-max"
import { Button } from "antd"

const AccessPage: React.FC = () => {
  const access = useAccess()
  return (
    <Page pageTitle="Access">
      <Access accessible={access.canSeeAdmin}>
        <Button>Admin Button</Button>
      </Access>
    </Page>
  )
}

export default AccessPage
