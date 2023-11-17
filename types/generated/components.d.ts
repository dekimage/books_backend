import type { Schema, Attribute } from '@strapi/strapi';

export interface ContentStep extends Schema.Component {
  collectionName: 'components_content_steps';
  info: {
    displayName: 'step';
    icon: 'server';
    description: '';
  };
  attributes: {
    content: Attribute.RichText;
  };
}

export interface ContentSubtask extends Schema.Component {
  collectionName: 'components_content_subtasks';
  info: {
    displayName: 'subtask';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    content: Attribute.String;
  };
}

export interface DeckCard extends Schema.Component {
  collectionName: 'components_deck_cards';
  info: {
    displayName: 'card';
    icon: 'cube';
    description: '';
  };
  attributes: {
    order: Attribute.Integer;
    idea: Attribute.Relation<'deck.card', 'oneToOne', 'api::idea.idea'>;
    routine: Attribute.Relation<
      'deck.card',
      'oneToOne',
      'api::routine.routine'
    >;
    task: Attribute.Relation<'deck.card', 'oneToOne', 'api::task.task'>;
    question: Attribute.Relation<
      'deck.card',
      'oneToOne',
      'api::question.question'
    >;
    type: Attribute.Enumeration<['idea', 'task', 'routine', 'question']>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'content.step': ContentStep;
      'content.subtask': ContentSubtask;
      'deck.card': DeckCard;
    }
  }
}
