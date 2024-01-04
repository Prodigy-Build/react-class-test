const extend = require('../utils/extend').default;

function CommentThreadStore(item, onCommentsChanged) {
  const itemId = item.id;
  const [comments, setComments] = useState({});
  const [children, setChildren] = useState({[item.id]: []});
  const [isNew, setIsNew] = useState({});
  const [isCollapsed, setIsCollapsed] = useState({});
  const [deadComments, setDeadComments] = useState({});

  const getChildCounts = (comment) => {
    let childCount = 0;
    let newCommentCount = 0;
    let nodes = [comment.id];

    while (nodes.length) {
      let nextNodes = [];
      for (let i = 0, l = nodes.length; i < l; i++) {
        const nodeChildren = children[nodes[i]];
        if (nodeChildren.length) {
          nextNodes.push(...nodeChildren);
        }
      }
      for (let i = 0, l = nextNodes.length; i < l; i++) {
        if (isNew[nextNodes[i]]) {
          newCommentCount++;
        }
      }
      childCount += nextNodes.length;
      nodes = nextNodes;
    }

    return {
      children: childCount,
      newComments: newCommentCount
    };
  };

  const commentAdded = (comment) => {
    if (comment.deleted) {
      return;
    }

    setComments((prevComments) => ({
      ...prevComments,
      [comment.id]: comment
    }));

    setChildren((prevChildren) => ({
      ...prevChildren,
      [comment.id]: []
    }));

    setChildren((prevChildren) => ({
      ...prevChildren,
      [comment.parent]: [...prevChildren[comment.parent], comment.id]
    }));

    if (comment.dead) {
      setDeadComments((prevDeadComments) => ({
        ...prevDeadComments,
        [comment.id]: true
      }));
    }
  };

  const commentDeleted = (comment) => {
    if (!comment) {
      return;
    }

    setComments((prevComments) => {
      const updatedComments = { ...prevComments };
      delete updatedComments[comment.id];
      return updatedComments;
    });

    setChildren((prevChildren) => {
      const updatedChildren = { ...prevChildren };
      const siblings = updatedChildren[comment.parent];
      const index = siblings.indexOf(comment.id);
      siblings.splice(index, 1);
      return updatedChildren;
    });

    if (comment.dead) {
      setDeadComments((prevDeadComments) => {
        const updatedDeadComments = { ...prevDeadComments };
        delete updatedDeadComments[comment.id];
        return updatedDeadComments;
      });
    }
  };

  const toggleCollapse = (commentId) => {
    setIsCollapsed((prevIsCollapsed) => ({
      ...prevIsCollapsed,
      [commentId]: !prevIsCollapsed[commentId]
    }));

    onCommentsChanged({ type: 'collapse' });
  };

  return {
    itemId,
    comments,
    children,
    isNew,
    isCollapsed,
    deadComments,
    getChildCounts,
    commentAdded,
    commentDeleted,
    toggleCollapse
  };
}

export default CommentThreadStore;