function pageCalc(pageNum, pageSize, numItems) {
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = Math.min(numItems, startIndex + pageSize)
  const hasNext = endIndex < numItems - 1
  return {pageNum, startIndex, endIndex, hasNext}
}

export default pageCalc