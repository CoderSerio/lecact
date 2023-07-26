import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './flags';
import { HostComponent, HostRoot, HostText } from './workTags';

/**
 * 构建一个离屏的 DOM 树，将其插入 parent 中
 * 我们要插入的是节点的child
 * 因为节点本身长这样： <A><B/></A>没错，B确实是A的子节点，但是要被插入的是B的内容
 * 甚至可能更复杂，A有多个子节点————这就是为什么叫 appendAllChildren
 * 这里做了一个优化：插入n个单节点 -> 组合成树插入一次
 *
 * 向下和向右(找兄弟节点)遍历，
 * 然后同时不断地建立 return 和 sibling 关系
 */
function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(node?.stateNode, parent);
		} else if (node?.child !== null) {
			// 向下找子节点
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			// 如果没有兄弟节点，那么就向上返回
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * 副作用标记冒泡
 * 构建 fiberNode 树之后，一部分节点会被标记，
 * 如果再 DFS 找一次的话效率太低了，所以全部冒泡到父级上就可以了
 */
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		// 这一手操作，直接同时包含子节点的 flags 和 subtree flags，
		// 这也就是为什么用离散的二进制表示不同的点
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		// 这样就把同一层节点和它们的子树的副作用标签全部聚敛到父节点上了
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}

/** 递归消费JSX的 归 阶段
 *
 * 需要构建一棵离屏的 DOM 树
 */
export const completeWork = (wip: FiberNode) => {
	// 比较，然后返回子 fiberNode

	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update 流程
			} else {
				// mount 流程
				// 构建 DOM
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				// 优化，先构建离屏 DOM 树
				appendAllChildren(instance, wip);
				// 将 wip 及其下的整棵树 插入到 instance 中
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// 为啥这里插入文本不需要 appendAllChildren呢？
				// 因为我们插入的其实是节点的child，文本没有child，可以直接插入
				// 至于为什么是child而不是节点本身呢，这一点可以上面 appendAllChildren 的注释
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;

		case HostRoot:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork的情况', wip);
			}
			break;
	}
};
