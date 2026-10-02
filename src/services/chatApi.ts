import type { Message } from '../features/conversation/conversation.types';
import { createMockConversation } from '../features/conversation/mockConversation';

/*
 * Mock chat backend with simulated latency. The scenario is switched from the
 * dev menu (R7) to force each load and send state.
 */

export type Scenario = 'normal' | 'empty' | 'loadFails' | 'sendsFail';

export const LOAD_DELAY_MS = 800;
export const SEND_DELAY_MS = 1000;

let scenario: Scenario = 'normal';

export function setScenario(next: Scenario): void {
  scenario = next;
}

export function getScenario(): Scenario {
  return scenario;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchConversation(): Promise<Message[]> {
  await delay(LOAD_DELAY_MS);
  if (scenario === 'loadFails') {
    throw new Error('Unable to load conversation.');
  }
  return scenario === 'empty' ? [] : createMockConversation();
}

export async function sendMessage(_text: string): Promise<void> {
  await delay(SEND_DELAY_MS);
  if (scenario === 'sendsFail') {
    throw new Error('Unable to send message.');
  }
}
