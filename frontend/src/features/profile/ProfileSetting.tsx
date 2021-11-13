import React, { useEffect, useState } from "react";
import {
    Container, Form, Button, Image,
} from "react-bootstrap";
import { useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateProfile } from "../auth/authSlice";

import avatar from "../../common/assets/avatar.jpg";

interface ProfileSettingProps {

}

export default function ProfileSetting(props : ProfileSettingProps) {
    const account = useAppSelector((state) => state.auth.account);
    const [profileImage, setProfileImage] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [real_name, setreal_name] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const dispatch = useAppDispatch();
    const history = useHistory();

    useEffect(() => {
        if (account) {
            if (account.email) setEmail(account.email);
            if (account.real_name) setreal_name(account.real_name);
            if (account.bio) setBio(account.bio);
            if (account.password) setPassword(account.password);
        }
    }, [dispatch]);

    const onSubmit = () => {
        const submit = async () => {
            await dispatch(updateProfile({
                email, real_name, bio, password: password || account?.password as string,
            }));
            alert("Changes saved");
        };
        submit();
    };

    if (!account) return <div>Error!</div>;

    // TODO: Signup form에 맞춰서 좀 고쳐야 할듯...
    // TODO: Form validaaaaaation

    return (
        // Todo: Photo upload
        <Container style={{ maxWidth: 500 }} className="mt-3">
            <h4 className="mb-3 mt-5">Profile Settings</h4>
            <Form>
                <Form.Group>
                    <Form.Label className="d-block">Profile Image</Form.Label>
                    <div className="d-flex align-items-center">
                        <Form.Control
                            id="change-profile-image-input"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            // onChange={({ target }) => setProfileImage(target.)}
                            className="mx-4"
                        />
                        <Image
                            roundedCircle
                            src={account.profile_picture ? account.profile_picture : avatar}
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
                <Button id="submit-button" onClick={onSubmit}>Save changes</Button>
            </Form>
        </Container>
    );
}
