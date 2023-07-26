/*
	这个文件也就是 创建 update 和 updateQueue， 以及更新 updateQueue 的方法（入队、出队）
*/
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

/**
 * 创建一个 update 对象，
 * 这个对象的核心是包含一个 action，也就是各种更新操作，比如useState等等
 */
export function createUpdate<State>(action: Action<State>) {
	return {
		action
	};
}

/**
 *  创建 updateQueue, 后续可以通过 enqueueUpdate 为队列增加 action
 *
 *	返回值的核心内容是 updateQueue.shared.pending， 为什么是 shared 呢？
 * 	这是指在 current fiberNode 树 和 workInProgress fiberNode 树 之间去共享这一份数据
 */
export function createUpdateQueue<State>(): UpdateQueue<State> {
	return {
		shared: {
			pending: null
		}
	};
}

/**
 * 为 updateQUeue 增加 update 对象的方法
 *
 * TODO: 采用尾插法
 */
export function enqueueUpdate<State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) {
	updateQueue.shared.pending = update;
}

/** 消耗 update 的方法，有两种情况：
 * 1. baseState 为 1， update 为 2，那么 memoizedState 就是 2
 * 2. baseState 为 1, update 为 (x) => 2 * x，那么memoizedState 就是 2 * x 即 2
 *
 * 返回值就是 memoizedState，也就是更新完成后的状态
 */
export function processUpdateQueue<State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } {
	type Type = typeof processUpdateQueue<State>;
	const result: ReturnType<Type> = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// 处理直接传一个函数的作为新状态的情况
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}

	return result;
}
