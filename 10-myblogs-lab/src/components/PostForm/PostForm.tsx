
import { PostCallback } from '../../shared/shared-types';
import { Post } from '../../model/post.model';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DisplayFormikState } from '../DisplayFormikState/DispalyFormikState';
import React, { FC, useEffect } from 'react';

interface Props {
    post: Post | undefined;
    onSubmitPost: PostCallback;
}

interface MyFormValues {
    title: string;
    text: string;
    imageUrl?: string;
    categories?: string;
    keywords?: string;
}

export const PostForm: FC<Props> = ({ post, onSubmitPost }) => {
    const initialValues: MyFormValues = {
        title: post?.title || '',
        text: post?.text || '',
        imageUrl: post?.imageUrl || '',
        categories: post?.categories?.join(', ') || '',
        keywords: post?.keywords.join(', ') || ''
    }
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={async values => {
                await new Promise(resolve => setTimeout(resolve, 500));
                alert(JSON.stringify(values, null, 2));
            }}
            validationSchema={Yup.object().shape({
                title: Yup.string().required().min(2).max(40),
                text: Yup.string().required().min(2).max(1024),
                imageUrl: Yup.string().url(),
                categories: Yup.string().matches(/(([\w-_+]+)[,\s]+)+/),
                keywords: Yup.string().matches(/(([\w-_+]+)[,\s]+)+/),
            })}
        >
            {({ values, handleChange, dirty, touched, errors, isSubmitting, handleReset }) => {
                return (
                    <Form className="col s12">
                        <div className="row">
                            <div className="input-field col s6">
                                <Field type="text" className="validate" name="title"/>
                                <label className="active" htmlFor="title">Title</label>
                                {errors.title && touched.title && (
                                    <span className="helper-text" data-error={errors.title} data-success=""/>
                                )}
                            </div>
                        </div>
                        <button className="btn waves-effect waves-light" type="submit" name="action" disabled={isSubmitting ||
                            Object.values(touched).every(fieldTouched => !fieldTouched) ||
                            Object.values(errors).some(err => !!err === true)}>Submit<i className="material-icons right">send</i>
                        </button>
                        <button type="button" className="btn waves-effect waves-light"  onClick={handleReset}
                            disabled={!dirty || isSubmitting}> Reset <i className="material-icons right">cloud</i>
                        </button>
                        <DisplayFormikState />
                    </Form>
                )
            }}
        </Formik>
    );
};
