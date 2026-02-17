import { describe, expect, it } from 'vitest'
import {
  buildActivityEvents,
  groupActivityEventsByCollection,
  groupActivityEventsByDay,
  groupActivityEventsByMerchant,
} from './activity'

const listNameById = {
  l1: 'Tech Upgrades',
}

describe('buildActivityEvents', () => {
  it('builds and sorts price and availability events', () => {
    const events = buildActivityEvents(
      [
        {
          id: 'p1',
          checked_at: '2026-02-16T09:00:00.000Z',
          price: 249.99,
          currency: 'USD',
          items: { id: 'i1', title: 'Headphones', list_id: 'l1' },
        },
      ],
      [
        {
          id: 'a1',
          checked_at: '2026-02-16T10:00:00.000Z',
          is_available: false,
          items: { id: 'i1', title: 'Headphones', list_id: 'l1' },
        },
      ],
      listNameById,
    )

    expect(events).toHaveLength(2)
    expect(events[0].type).toBe('availability')
    expect(events[0].listName).toBe('Tech Upgrades')
    expect(events[0].itemId).toBe('i1')
    expect(events[0].listId).toBe('l1')
    expect(events[1].type).toBe('price')
    expect(events[1].message).toContain('$249.99')
  })

  it('handles missing joins gracefully', () => {
    const events = buildActivityEvents(
      [
        {
          id: 'p2',
          checked_at: '2026-02-16T08:00:00.000Z',
          price: 19,
          currency: 'USD',
          items: null,
        },
      ],
      [],
      {},
    )

    expect(events[0].itemTitle).toBe('Unknown item')
    expect(events[0].listName).toBe('Unassigned')
    expect(events[0].itemId).toBeNull()
    expect(events[0].listId).toBeNull()
  })
})

describe('groupActivityEventsByDay', () => {
  it('groups events into Today, Yesterday, and Earlier', () => {
    const events = buildActivityEvents(
      [
        {
          id: 'p-today',
          checked_at: '2026-02-16T09:00:00.000Z',
          price: 12.99,
          currency: 'USD',
          items: { id: 'i1', title: 'Mouse', list_id: 'l1', merchant: 'LogiTech' },
        },
        {
          id: 'p-old',
          checked_at: '2026-02-12T09:00:00.000Z',
          price: 199.99,
          currency: 'USD',
          items: { id: 'i2', title: 'Monitor', list_id: 'l1', merchant: 'Dell' },
        },
      ],
      [
        {
          id: 'a-yesterday',
          checked_at: '2026-02-15T18:30:00.000Z',
          is_available: true,
          items: { id: 'i1', title: 'Mouse', list_id: 'l1', merchant: 'LogiTech' },
        },
      ],
      listNameById,
    )

    const groups = groupActivityEventsByDay(events, new Date('2026-02-16T20:00:00.000Z'))

    expect(groups).toHaveLength(3)
    expect(groups[0].label).toBe('Today')
    expect(groups[0].events).toHaveLength(1)
    expect(groups[1].label).toBe('Yesterday')
    expect(groups[1].events).toHaveLength(1)
    expect(groups[2].label).toBe('Earlier')
    expect(groups[2].events).toHaveLength(1)
  })
})

describe('groupActivityEventsByMerchant', () => {
  it('groups events by merchant and keeps unknown values together', () => {
    const events = buildActivityEvents(
      [
        {
          id: 'p-1',
          checked_at: '2026-02-16T09:00:00.000Z',
          price: 12.99,
          currency: 'USD',
          items: { id: 'i1', title: 'Mouse', list_id: 'l1', merchant: 'LogiTech' },
        },
        {
          id: 'p-2',
          checked_at: '2026-02-16T08:00:00.000Z',
          price: 55,
          currency: 'USD',
          items: { id: 'i2', title: 'Desk Lamp', list_id: 'l1', merchant: 'IKEA' },
        },
      ],
      [
        {
          id: 'a-1',
          checked_at: '2026-02-16T07:00:00.000Z',
          is_available: true,
          items: { id: 'i3', title: 'Cable', list_id: 'l1', merchant: null },
        },
      ],
      listNameById,
    )

    const groups = groupActivityEventsByMerchant(events)

    expect(groups).toHaveLength(3)
    expect(groups[0].label).toBe('IKEA')
    expect(groups[0].events).toHaveLength(1)
    expect(groups[1].label).toBe('LogiTech')
    expect(groups[1].events).toHaveLength(1)
    expect(groups[2].label).toBe('Unknown merchant')
    expect(groups[2].events).toHaveLength(1)
  })
})

describe('groupActivityEventsByCollection', () => {
  it('groups events by collection name with unassigned fallback', () => {
    const events = buildActivityEvents(
      [
        {
          id: 'p-1',
          checked_at: '2026-02-16T09:00:00.000Z',
          price: 12.99,
          currency: 'USD',
          items: { id: 'i1', title: 'Mouse', list_id: 'l1', merchant: 'LogiTech' },
        },
      ],
      [
        {
          id: 'a-1',
          checked_at: '2026-02-16T07:00:00.000Z',
          is_available: false,
          items: { id: 'i3', title: 'Cable', list_id: null, merchant: 'Generic' },
        },
      ],
      listNameById,
    )

    const groups = groupActivityEventsByCollection(events)

    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe('Tech Upgrades')
    expect(groups[0].events).toHaveLength(1)
    expect(groups[1].label).toBe('Unassigned')
    expect(groups[1].events).toHaveLength(1)
  })
})
