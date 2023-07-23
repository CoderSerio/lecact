import { ReactElement } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memorizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memorizedState } = processUpdateQueue(baseState, pending);

	// 获取子 ReactElement 和 子 fiberNode 并进行对比，然后生成新的 fiberNode
	const nextChildren = wip.memorizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// HostComponent 中是无法触发更新的
function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = wip.memorizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

/**
 * 协调子节点，分为两种类型，一种是 mount 另一种是 update
 *
 * 这里针对 mount 流程存在一种优化策略，具体是内容是做 DOM 离线化，
 * 尽可能把多次 Placement 操作合并（ 这些Placement对应的节点构成了一个树，直接插入根节点即可）
 *
 * 一个比较有意思的事情是，在首屏渲染时， 毫无疑问 App 组件会走 mount 流程，
 * 然而——hostRootFiber 比较特殊，它在创建的时候就已经存在存在对应的 workInProgress fiberNode 了，
 * 所以它会走 update 流程
 */
function reconcileChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate;
	if (current !== null) {
		// 存在 current fiberNode 树，是 update 流程

		wip.child = reconcileChildrenFibers(wip, current?.child, children);
	} else {
		// 不存在， 则是 mount 流程
		wip.child = reconcileChildren(wip, null, children);
	}
}

/** 递归消费JSX的 递 阶段，需要做两件事：
 *
 * 1. 比较节点的 ReactElement 和 FiberNode, 计算最新值
 * 2. 返回 子fiberNode
 */
export function beginWork(wip: FiberNode) {
	// 比较，然后返回子 fiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		// return updateHostText(wip);
		default:
			if (__DEV__) {
				console.warn('benginWork，未实现的类型！');
			}
			break;
	}
	return null;
}
