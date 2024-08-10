'use client';

import { Event, EventType } from '@prisma/client';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { createEvent, getUsedSlugs, updateEvent } from '../db/events';
import { convertToDateTimeLocalString } from '../utils';

const validator = (slugs: string[]) =>
  Yup.object({
    name: Yup.string()
      .required('Required')
      .min(5, 'Must be at least 5 characters')
      .max(50, 'Must be at most 50 characters')
      .matches(
        /^(\w|\d)+( (\w|\d)+)*$/,
        'Must only contain alphanumeric characters and spaces'
      ),
    slug: Yup.string()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be pascal-case')
      .notOneOf(slugs, 'Must be unique'),
    directusId: Yup.number()
      .required('Required')
      .min(0, 'Must be a positive integer')
      .integer('Must be a positive integer'),
    eventStartTime: Yup.date().required('Required'),
    eventEndTime: Yup.date().required('Required'),
    staffingTimeSlotSize: Yup.number().required('Required').min(15),
  });

function FacultyDinner() {
  return (
    <>
      <label htmlFor="meals">Meals:</label>
      <Field id="meals" name="meals" placeholder="Meals" as="textarea" />
      <ErrorMessage name="meals" />
      <br />
    </>
  );
}

export default function EventForm({ initialValue }: { initialValue?: Event }) {
  const isUpdateForm = initialValue !== undefined;

  const slugInput = useRef<HTMLInputElement>(null);
  const [usedSlugs, setUsedSlugs] = useState([] as string[]);

  useEffect(() => {
    getUsedSlugs().then((r) => {
      if (r.ok) {
        setUsedSlugs(r.data.filter((e) => e !== initialValue?.slug));
      }
    });
  }, []);

  return (
    <Formik
      initialValues={{
        type: (initialValue?.type || EventType.OTHER) as EventType,
        name: initialValue?.name || '',
        slug: initialValue?.slug || '',
        directusId: parseInt(initialValue?.directusId) || 0,
        eventStartTime: initialValue
          ? convertToDateTimeLocalString(initialValue.eventStartTime)
          : '',
        eventEndTime: initialValue
          ? convertToDateTimeLocalString(initialValue.eventEndTime)
          : '',
        staffingTimeSlotSize: initialValue?.staffingTimeSlotSize || 15,
      }}
      onSubmit={(values) => {
        const event: Event = {
          ...values,
          id: initialValue?.id,
          eventStartTime: new Date(values.eventEndTime),
          eventEndTime: new Date(values.eventStartTime),
          mailTemplate: '',
          directusId: values.directusId.toString(),
          data: {},
        } as unknown as Event; //TODO Add missing fields
        console.log(event);

        if (isUpdateForm) {
          updateEvent(event);
        } else {
          createEvent(event);
        }
      }}
      validationSchema={validator(usedSlugs)}
      validateOnBlur
      validateOnMount
      validateOnChange
    >
      {({ values }) => (
        <Form>
          <label htmlFor="type">Type:</label>
          <Field id="type" name="type" as="select" readOnly={isUpdateForm}>
            {Object.values(EventType).map((t) => (
              <option value={t} key={t}>
                {t}
              </option>
            ))}
          </Field>
          <ErrorMessage name="type" />
          <br />

          <label htmlFor="name">Name:</label>
          <Field id="name" name="name" placeholder="My event" />
          <ErrorMessage name="name" />
          <br />

          <label htmlFor="slug">Slug (leave empty for default):</label>
          <Field
            id="slug"
            name="slug"
            placeholder="my-event"
            innerRef={slugInput}
          />
          <ErrorMessage name="slug" />
          <br />

          <label htmlFor="directusId">Directus id:</label>
          <Field id="directusId" name="directusId" type="number" />
          <ErrorMessage name="directusId" />
          <br />

          <label htmlFor="eventStartTime">Start:</label>
          <Field
            id="eventStartTime"
            name="eventStartTime"
            type="datetime-local"
          />
          <ErrorMessage name="eventStartTime" />
          <br />

          <label htmlFor="eventEndTime">End:</label>
          <Field id="eventEndTime" name="eventEndTime" type="datetime-local" />
          <ErrorMessage name="eventEndTime" />
          <br />

          <label htmlFor="staffingTimeSlotSize">Staffing slot size:</label>
          <Field
            id="staffingTimeSlotSize"
            name="staffingTimeSlotSize"
            type="number"
          />
          <ErrorMessage name="staffingTimeSlotSize" />
          <br />

          {values.type === 'FACULTY_DINNER' ? <FacultyDinner /> : <></>}

          <button type="submit">{isUpdateForm ? 'Update' : 'Create'}</button>
        </Form>
      )}
    </Formik>
  );
}
