import { Layout, Row, Typography } from "antd"
import React from "react"

interface Props {
  name: string
}

const Guide: React.FC<Props> = (props) => {
  const { name } = props
  return (
    <Layout>
      <Row>
        <Typography.Title level={3}>
          <strong>{name}</strong>
        </Typography.Title>
      </Row>
    </Layout>
  )
}

export default Guide
