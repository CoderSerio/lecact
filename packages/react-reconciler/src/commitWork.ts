import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './flags';
import { HostComponent, HostRoot, HostText } from './workTags';

/** 下一个需要执行 Effect 的**节点**
 *  注意是节点，只是名字取得比较奇怪
 */
let nextEffect: FiberNode | null = null;

/** 真正执行插入节点 */
const appendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container
) => {
	// 我们插入的节点不可能是 HostRoot
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};

/** 获取原生的父级 DOM 节点
 *  主要处理两种情况
 */
const getHostParent = (fiber: FiberNode) => {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}

	if (__DEV__) {
		console.warn('获取hostParent失败');
	}
};

/** 处理 Placement，插入操作 */
const commitPlacement = (finishedWork: FiberNode) => {
	//
	if (__DEV__) {
		console.log('执行Placement操作', finishedWork);
	}

	/** 原生父级 DOM */
	const hostParent = getHostParent(finishedWork) as Container;
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

/** 具体地开始处理 MutationMask 中的每一种 */
const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		// 将已经被处理的状态移除掉
		finishedWork.flags &= ~Placement;
	}
	// TODO: 同样的方式判断其他几个 effect
};

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 找到底了 或者 不包含 MutationMask，
			// 那么处理一下 effect 然后回到上一层
			while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					// 记住nextEffect是全局变量，这里break之后继续找它的子节点——DFS
					break;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};
