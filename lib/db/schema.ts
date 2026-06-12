import {
  pgTable, uuid, text, integer, boolean, timestamp, jsonb,
} from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id:                   uuid('id').primaryKey(),
  displayName:          text('display_name'),
  avatarUrl:            text('avatar_url'),
  autocompleteEnabled:  boolean('autocomplete_enabled').notNull().default(false),
  defaultTone:          text('default_tone').notNull().default('Balanced'),
  defaultLength:        text('default_length').notNull().default('Medium'),
  defaultAudience:      text('default_audience').notNull().default('General'),
  createdAt:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const spaces = pgTable('spaces', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ownerId:    uuid('owner_id').notNull(),
  name:       text('name').notNull(),
  sortOrder:  integer('sort_order').notNull().default(0),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const boards = pgTable('boards', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ownerId:    uuid('owner_id').notNull(),
  spaceId:    uuid('space_id'),
  name:       text('name').notNull(),
  icon:       text('icon'),
  color:      text('color'),
  sortOrder:  integer('sort_order').notNull().default(0),
  isPinned:   boolean('is_pinned').notNull().default(false),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sections = pgTable('sections', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ownerId:    uuid('owner_id').notNull(),
  boardId:    uuid('board_id').notNull(),
  name:       text('name').notNull(),
  sortOrder:  integer('sort_order').notNull().default(0),
})

export const documents = pgTable('documents', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ownerId:    uuid('owner_id').notNull(),
  boardId:    uuid('board_id'),
  sectionId:  uuid('section_id'),
  title:      text('title').notNull().default('Untitled'),
  content:    jsonb('content').notNull().default({}),
  tone:       text('tone').notNull().default('Balanced'),
  length:     text('length').notNull().default('Medium'),
  audience:   text('audience').notNull().default('General'),
  wordCount:  integer('word_count').notNull().default(0),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const documentVersions = pgTable('document_versions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  documentId:  uuid('document_id').notNull(),
  ownerId:     uuid('owner_id').notNull(),
  content:     jsonb('content').notNull(),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const subscriptions = pgTable('subscriptions', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  ownerId:               uuid('owner_id').notNull().unique(),
  stripeCustomerId:      text('stripe_customer_id'),
  stripeSubscriptionId:  text('stripe_subscription_id'),
  status:                text('status').notNull().default('trialing'),
  plan:                  text('plan'),
  currentPeriodEnd:      timestamp('current_period_end', { withTimezone: true }),
  trialEndsAt:           timestamp('trial_ends_at', { withTimezone: true }),
  createdAt:             timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:             timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const aiUsage = pgTable('ai_usage', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ownerId:    uuid('owner_id').notNull(),
  action:     text('action').notNull(),
  tokensIn:   integer('tokens_in').default(0),
  tokensOut:  integer('tokens_out').default(0),
  model:      text('model'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
