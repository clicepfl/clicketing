'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRef } from 'react';
import * as Yup from 'yup';
import { createEvent } from '../../../../db/events';

const validator = Yup.object({
  name: Yup.string()
    .required('Required')
    .min(5, 'Must be at least 5 characters')
    .max(50, 'Must be at most 50 characters')
    .matches(
      /^(\w|\d)+( (\w|\d)+)*$/,
      'Must only contain alphanumeric characters and spaces'
    ),
  slug: Yup.string().matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Must be pascal-case'
  ),
  directusId: Yup.number().required('Required').min(0),
  startTime: Yup.date().required('Required'),
  endTime: Yup.date().required('Required'),
  staffingSlotSize: Yup.number().required('Required').min(15),
});

export default function Page() {
  const slugInput = useRef<HTMLInputElement>(null);

  return (
    <Formik
      initialValues={{
        name: '',
        slug: '',
        directusId: 0,
        startTime: '',
        endTime: '',
        staffingSlotSize: 15,
      }}
      onSubmit={(v) => createEvent(v)}
      validationSchema={validator}
      validateOnBlur
      validateOnMount
      validateOnChange
    >
      <Form>
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

        <label htmlFor="startTime">Start:</label>
        <Field id="startTime" name="startTime" type="datetime-local" />
        <ErrorMessage name="startTime" />
        <br />

        <label htmlFor="endTime">End:</label>
        <Field id="endTime" name="endTime" type="datetime-local" />
        <ErrorMessage name="endTime" />
        <br />

        <label htmlFor="staffingSlotSize">Staffing slot size:</label>
        <Field id="staffingSlotSize" name="staffingSlotSize" type="number" />
        <ErrorMessage name="staffingSlotSize" />
        <br />

        <button type="submit">Create</button>
      </Form>
    </Formik>
  );
}
