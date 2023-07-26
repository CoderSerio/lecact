import { ReactElement } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;
	// 获取子 ReactElement 和 子 fiberNode 并进行对比，然后生成新的 fiberNode
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// HostComponent 中是无法触发更新的——因为不是组件
function updateHostComponent(wip: FiberNode) {
	// 为什么获取的是props, 比如对于 <div><span/></div>
	// span 是在 div 对应的 fiber 的 props.children 中的
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
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
		// 不会存在大量的插入操作
		wip.child = reconcileChildFibers(wip, current?.child, children) as any;
	} else {
		// 不存在， 则是 mount 流程
		// 存在大量的插入操作
		wip.child = mountChildFibers(wip, null, children) as any;
	}
	return null;
}

/**
 * 对子节点做更新
 * 递归消费JSX的 递 阶段，需要做两件事：
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
			// 文本不可能有子节点，所以直接不用处理
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
