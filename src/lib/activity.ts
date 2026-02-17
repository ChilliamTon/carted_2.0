export type ActivityType = 'price' | 'availability'

export interface ActivityEvent {
  id: string
  type: ActivityType
  checkedAt: string
  itemId: string | null
  listId: string | null
  merchant: string | null
  itemTitle: string
  listName: string
  message: string
  tone: 'good' | 'bad' | 'neutral'
}

export interface ActivityEventGroup {
  label: 'Today' | 'Yesterday' | 'Earlier'
  events: ActivityEvent[]
}

export interface ActivityEventGroupByLabel {
  label: string
  events: ActivityEvent[]
}

type JoinedItem = {
  id?: string
  title?: string | null
  list_id?: string | null
  merchant?: string | null
}

type PriceRow = {
  id: string
  checked_at: string
  price: number
  currency?: string | null
  items?: JoinedItem | JoinedItem[] | null
}

type AvailabilityRow = {
  id: string
  checked_at: string
  is_available: boolean
  items?: JoinedItem | JoinedItem[] | null
}

function normalizeItem(value: JoinedItem | JoinedItem[] | null | undefined): JoinedItem | null {
  if (!value) return null
  if (Array.isArray(value)) return value[0] ?? null
  return value
}

function formatCurrency(price: number, currency?: string | null): string {
  if (!currency || currency === 'USD') {
    return `$${price.toFixed(2)}`
  }

  return `${currency.toUpperCase()} ${price.toFixed(2)}`
}

export function buildActivityEvents(
  priceRows: PriceRow[],
  availabilityRows: AvailabilityRow[],
  listNameById: Record<string, string>,
): ActivityEvent[] {
  const priceEvents: ActivityEvent[] = priceRows.map((row) => {
    const item = normalizeItem(row.items)
    const listName = item?.list_id ? listNameById[item.list_id] ?? 'Unassigned' : 'Unassigned'

    return {
      id: `price-${row.id}`,
      type: 'price',
      checkedAt: row.checked_at,
      itemId: item?.id ?? null,
      listId: item?.list_id ?? null,
      merchant: item?.merchant ?? null,
      itemTitle: item?.title || 'Unknown item',
      listName,
      message: `Price checked at ${formatCurrency(row.price, row.currency)}`,
      tone: 'neutral',
    }
  })

  const availabilityEvents: ActivityEvent[] = availabilityRows.map((row) => {
    const item = normalizeItem(row.items)
    const listName = item?.list_id ? listNameById[item.list_id] ?? 'Unassigned' : 'Unassigned'

    return {
      id: `availability-${row.id}`,
      type: 'availability',
      checkedAt: row.checked_at,
      itemId: item?.id ?? null,
      listId: item?.list_id ?? null,
      merchant: item?.merchant ?? null,
      itemTitle: item?.title || 'Unknown item',
      listName,
      message: row.is_available ? 'Item is in stock' : 'Item is out of stock',
      tone: row.is_available ? 'good' : 'bad',
    }
  })

  return [...priceEvents, ...availabilityEvents].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
  )
}

function getUtcStartOfDay(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
}

export function groupActivityEventsByDay(
  events: ActivityEvent[],
  now: Date = new Date(),
): ActivityEventGroup[] {
  const todayStart = getUtcStartOfDay(now)
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

  const groups: ActivityEventGroup[] = [
    { label: 'Today', events: [] },
    { label: 'Yesterday', events: [] },
    { label: 'Earlier', events: [] },
  ]

  for (const event of events) {
    const eventStart = getUtcStartOfDay(new Date(event.checkedAt))

    if (eventStart === todayStart) {
      groups[0].events.push(event)
      continue
    }

    if (eventStart === yesterdayStart) {
      groups[1].events.push(event)
      continue
    }

    groups[2].events.push(event)
  }

  return groups.filter((group) => group.events.length > 0)
}

function groupActivityEventsByLabel(
  events: ActivityEvent[],
  getLabel: (event: ActivityEvent) => string,
): ActivityEventGroupByLabel[] {
  const grouped = new Map<string, ActivityEvent[]>()

  for (const event of events) {
    const label = getLabel(event)
    const bucket = grouped.get(label)

    if (bucket) {
      bucket.push(event)
      continue
    }

    grouped.set(label, [event])
  }

  return [...grouped.entries()]
    .sort(([labelA], [labelB]) => labelA.localeCompare(labelB))
    .map(([label, groupedEvents]) => ({
      label,
      events: groupedEvents,
    }))
}

export function groupActivityEventsByMerchant(
  events: ActivityEvent[],
): ActivityEventGroupByLabel[] {
  return groupActivityEventsByLabel(events, (event) => event.merchant || 'Unknown merchant')
}

export function groupActivityEventsByCollection(
  events: ActivityEvent[],
): ActivityEventGroupByLabel[] {
  return groupActivityEventsByLabel(events, (event) => event.listName || 'Unassigned')
}
