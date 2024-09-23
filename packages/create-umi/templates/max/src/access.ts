export default (initialState: any) => {
  // https://umijs.org/docs/max/access
  const canSeeAdmin = !!(initialState && initialState.name !== "dontHaveAccess")
  return {
    canSeeAdmin,
  }
}
