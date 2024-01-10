import { useState } from 'react';
import extend from '../utils/extend';

function CommentThreadStore(item, onCommentsChanged) {
  const [itemId] = useState(item.id);
  const [comments, setComments] = useState({});
  const [children, setChildren] = useState({ [item.id]: [] });
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
      const newComments = { ...prevComments };
      delete newComments[comment.id];
      return newComments;
    });
    setChildren((prevChildren) => {
      const newChildren = { ...prevChildren };
      const siblings = newChildren[comment.parent];
      siblings.splice(siblings.indexOf(comment.id), 1);
      return newChildren;
    });
    if (comment.dead) {
      setDeadComments((prevDeadComments) => {
        const newDeadComments = { ...prevDeadComments };
        delete newDeadComments[comment.id];
        return newDeadComments;
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