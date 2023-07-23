import { Container } from 'hostConfig';
import { ReactElement } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdateQueue,
	enqueueUpdate,
	createUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

/** createRoot 方法底层调用的 API，在 Mount 阶段可能被调用，目的是创建 fiberRootNode
 *
 *  实现了 fiberRootNode 和 hostRootFiber 的互相指向：
 *
 * fiberRootNode.current === hostRootFiber
 *
 *  hostRootFiber.stateNode = fiberRootNode
 * */
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

/** render 方法底层调用的 API，在 Mount 阶段可能被调用，
 * 产生 update 对象并将其加入到 hostRootFiber 的 updateQueue 中
 *
 * (什么？你问为什么不是加入到 fiberRootNode 的 updateQueue?
 * 很显然，因为 fiberRootNode 它并不是一个 fiberNode 类型，没有 updateQueue, 再去复习一下吧！)
 *
 *  更新完毕之后会调用 scheduleUpdateOnFiber 方法开启调度
 *  实现了首屏渲染与触发更新后渲染的功能相连接
 */
export function updateContainer(
	element: ReactElement | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElement | null>(element);
	// 进入 updateQueue.ts 中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
		update
	);

	// 开始调度，进入 workLoop.ts
	scheduleUpdateOnFiber(hostRootFiber);
	return Element;
}
