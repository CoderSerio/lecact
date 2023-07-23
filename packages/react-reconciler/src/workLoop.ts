import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

/** 全局指针，指向正在工作的 fiberNode */
let workInProgress: FiberNode | null = null;

/** 访问下一个兄弟节点, 如果不存在那么则访问父级节点，开始 归 */
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode = fiber;
	do {
		// 会对node进行重新赋值
		completeWork(node);
		const sibling = node.sibling;
		if (sibling) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
	} while (node !== null);
}

/** 访问下一个 fiberNode，有子节点遍历子节点；没有子节点则遍历兄弟节点 */
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memorizedProps = fiber.pendingProps;

	if (next === null) {
		// 子节点遍历结束，开始遍历兄弟节点
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

/** 遍历 fiber 树: 循环调用 performUnitOfWork 方法访问下一个 fiberNode */
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

/** 初始化，指向需要遍历的第一个 fiberRootNode
 *  也就是即将开始计算生成 fiber树——即初始化 workInProgress fiber 树
 */
function prepareFreshStack(fiberRootNode: FiberRootNode) {
	// 初始化，所以 props 传空对象即可
	workInProgress = createWorkInProgress(fiberRootNode.current, {});
}

/**
 * 从当前 fiberNode 开始向上，找到并返回 fiberRootNode（指向了 fiber 树根节点的那个东西）
 *
 * hostRootFiber 的 return 值为 null（只有一个 stateNode 属性指向  fiberRootNode），
 * 并且有个单独的类型叫 HostRoot
 *
 * 凭借这两点可以将其与普通的 fiberRootNode 区分
 *
 * */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

/**
 * 作用是执行更新。
 * 触发更新时，就会调用这个方法。
 * 触发更新的方法包括但不限于这些：
 * 1. createRoot （老版本里面是 render)
 * 2. useState的 dispatcher （老版本里面是 this.setState）
 * 可以看出，触发更新的方式很多，所以就需要一个统一的、易扩展的更细方式：
 * 1. 首先我们要有一个代表更新的数据结构，即 Update
 * 2. 然后能消费这个它，消费它的数据结构就是 UpdateQueue (UpdateQueue.sharedPending = Update[])
 * 这里也就是批处理的实现关键
 */
function renderRoot(fiberRootNode: FiberRootNode) {
	// 生成 hostRootFiber 对应的 workInProgress hostRooFiber
	prepareFreshStack(fiberRootNode);
	// 正式进入 workLoop 的过程，开始更新
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop出错', e);
			}
			workInProgress = null;
		}
	} while (true);

	// 计算完成后的 workInProgress fiber 树
	const finishedWip = fiberRootNode.current.alternate;
	fiberRootNode.finishedWork = finishedWip;
	// 执行具体的操作
	commitRoot(fiberRootNode);
}

/**
 *  开始调度，也承接了 reconcile。
 *  会调用 markUpdateFromFiberToRoot，从当前 fiberNode 向上查找获取到 fiberRootNode
 * 	然后从根节点开始计算新的 fiberNode 树
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const fiberRootNode = markUpdateFromFiberToRoot(fiber);
	renderRoot(fiberRootNode);
}
