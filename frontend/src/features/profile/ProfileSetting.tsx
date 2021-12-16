import React, { useEffect, useState } from "react";
import {
    Container, Form, Button, Image,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { removeProfilePicture, updateProfile, updateProfilePicture } from "../auth/authSlice";

import avatar from "../../common/assets/avatar.jpg";
import { Visibility } from "../../common/Interfaces";

// suppress no-tsx-component-props
export default function ProfileSetting() {
    const account = useAppSelector((state) => state.auth.account);
    const profileImage = useAppSelector((state) => state.auth.account?.profile_picture);
    const [email, setEmail] = useState<string>("");
    const [emailIsValid, setEmailIsValid] = useState<boolean>(true);
    const [realName, setRealName] = useState<string>("");
    const [realNameIsValid, setRealNameIsValid] = useState<boolean>(true);
    const [password, setPassword] = useState<string>("");
    const [passwordIsValid, setPasswordIsValid] = useState<boolean>(true);
    const [bio, setBio] = useState<string>("");
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (account) {
            if (account.email) setEmail(account.email);
            if (account.real_name) setRealName(account.real_name);
            if (account.bio) setBio(account.bio);
            if (account.password) setPassword(account.password);
            if (account.visibility) setVisibility(account.visibility);
        }
    }, [dispatch, account]);

    const onAddProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const temp = new FormData();
        if (!event.target.files) return;
        Array.from(event.target.files).forEach((value) => {
            temp.append("image", value);
            const fileReader = new FileReader();
            fileReader.readAsDataURL(value);
        });
        dispatch(updateProfilePicture(temp));
    };

    const onSubmit = () => {
        const submit = async () => {
            await dispatch(updateProfile({
                email,
                real_name: realName,
                bio,
                password: password || undefined,
                visibility,
            }));
            toast.success("Changes saved");
        };
        submit();
        setPassword("");
    };

    if (!account) return <div>Error!</div>;

    return (
        <Container style={{ maxWidth: 500 }} className="mt-3">
            <h4 className="mb-3 mt-5">Account Settings</h4>
            <Form>
                <Form.Group>
                    <Form.Label className="d-block">Profile Image</Form.Label>
                    <div className="d-flex align-items-center">
                        <div
                            className="mx-4"
                        >
                            <Form.Control
                                id="change-profile-image-input"
                                type="file"
                                accept=".jpg, .jpeg, .png"
                                onChange={onAddProfileImage}
                            />
                            <Button
                                variant="link"
                                onClick={() => dispatch(removeProfilePicture())}
                            >
                                Delete profile image

                            </Button>
                        </div>
                        <Image
                            roundedCircle
                            src={profileImage ?? avatar}
                            width="150px"
                            className="mx-3 mb-2"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        id="change-email-input"
                        type="email"
                        value={email}
                        onChange={({ target }) => {
                            setEmail(target.value);
                            setEmailIsValid(/^[^@\s]+@[A-Za-z\d.]+$/.test(target.value));
                        }}
                        isValid={emailIsValid}
                        isInvalid={!emailIsValid}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        id="change-real-name-input"
                        value={realName}
                        onChange={({ target }) => {
                            setRealName(target.value);
                            setRealNameIsValid(/^[a-zA-Z][a-zA-Z\s]*$/.test(target.value) && target.value.length <= 15);
                        }}
                        isValid={realNameIsValid}
                        isInvalid={!realNameIsValid}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please write your name in English.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        id="change-password-input"
                        type="password"
                        value={password}
                        onChange={({ target }) => {
                            setPassword(target.value);
                            setPasswordIsValid(
                                /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
                                    .test(target.value),
                            );
                        }}
                        isValid={passwordIsValid && password.length > 0}
                        isInvalid={!passwordIsValid && password.length > 0}
                    />
                    <Form.Control.Feedback type="invalid">
                        Password should be 8 letters or longer with at least one number and alphabet.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                        id="change-bio-input"
                        as="textarea"
                        value={bio}
                        onChange={({ target }) => setBio(target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <h6>Account visibility</h6>
                    <div className="mt-3">
                        <Form.Check
                            inline
                            label="Anyone"
                            type="checkbox"
                            checked={visibility === Visibility.ALL}
                            onChange={() => setVisibility(Visibility.ALL)}
                        />
                        <Form.Check
                            inline
                            label="Friends"
                            type="checkbox"
                            checked={visibility === Visibility.MEMBER_AND_FRIENDS}
                            onChange={() => setVisibility(Visibility.MEMBER_AND_FRIENDS)}
                        />
                        <Form.Check
                            inline
                            label="No One"
                            type="checkbox"
                            checked={visibility === Visibility.ONLY_MEMBERS}
                            onChange={() => setVisibility(Visibility.ONLY_MEMBERS)}
                        />
                    </div>
                </Form.Group>
                <Button
                    id="submit-button"
                    onClick={onSubmit}
                    disabled={!(emailIsValid && realNameIsValid && passwordIsValid)}
                >
                    Save changes

                </Button>
            </Form>
            <ToastContainer />
        </Container>
    );
}
