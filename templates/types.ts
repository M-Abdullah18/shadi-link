import React from 'react';
import { SupportedLanguage } from '../src/config';

export interface EditableField {
  id: string;
  labelEn: string;
  labelUr: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'url';
  required?: boolean;
  placeholder?: string;
}

export interface TemplateEvent {
  id: string;
  name: string;
  nameUr?: string;
  date: string;
  dateUr?: string;
  time: string;
  timeUr?: string;
  venueName: string;
  venueNameUr?: string;
  venueAddress: string;
  venueAddressUr?: string;
  city: string;
  cityUr?: string;
  googleMapsUrl?: string;
  dressCode?: string;
  dressCodeUr?: string;
  startsAt?: string | Date;
}

export interface TemplateWeddingData {
  id: string;
  designCode: string;
  designSlug: string;
  coupleNames: {
    groom: string;
    groomUr?: string;
    bride: string;
    brideUr?: string;
  };
  parentsNames?: {
    groomParents?: string;
    groomParentsUr?: string;
    brideParents?: string;
    brideParentsUr?: string;
  };
  weddingDate: string; // ISO date or formatted for countdown
  events: TemplateEvent[];
  customMessage?: string;
  customMessageUr?: string;
}

export interface TemplateComponentProps {
  data: TemplateWeddingData;
  language: SupportedLanguage;
  guestName?: string;
  isCommonLink?: boolean;
}

export interface TemplateManifest {
  slug: string;
  name: string;
  nameUrdu: string;
  code: string;
  mood: {
    en: string;
    ur: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    previewColors: string[];
  };
  description: {
    en: string;
    ur: string;
  };
  supportedLanguages: SupportedLanguage[];
  editableFields: EditableField[];
  sampleData: TemplateWeddingData;
  component: React.ComponentType<TemplateComponentProps>;
  thumbnail: React.ComponentType<{ className?: string }>;
}
