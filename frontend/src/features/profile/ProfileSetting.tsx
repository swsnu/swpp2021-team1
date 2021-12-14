import React, { useEffect, useState } from "react";
import {
    Container, Form, Button, Image,
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { removeProfilePicture, updateProfile, updateProfilePicture } from "../auth/authSlice";

import avatar from "../../common/assets/avatar.jpg";
import { Visibility } from "../../common/Interfaces";

// suppress no-tsx-component-props
export default function ProfileSetting() {
    const account = useAppSelector((state) => state.auth.account);
    const profileImage = useAppSelector((state) => state.auth.account?.profile_picture);
    const [email, setEmail] = useState<string>("");
    const [real_name, setreal_name] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (account) {
            if (account.email) setEmail(account.email);
            if (account.real_name) setreal_name(account.real_name);
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
                real_name,
                bio,
                password: password || undefined,
                visibility,
            }));
            alert("Changes saved");
        };
        submit();
        setPassword("");
    };

    if (!account) return <div>Error!</div>;

    // TODO: Signup form에 맞춰서 좀 고쳐야 할듯...
    // TODO: Form validaaaaaation

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
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        id="change-email-input"
                        type="email"
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        id="change-real-name-input"
                        value={real_name}
                        onChange={({ target }) => setreal_name(target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        id="change-password-input"
                        type="password"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
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
                <Button id="submit-button" onClick={onSubmit}>Save changes</Button>
            </Form>
        </Container>
    );
}
