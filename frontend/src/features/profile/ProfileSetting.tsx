import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

interface ProfileSettingProps {

}

export default function ProfileSetting(props : ProfileSettingProps) {

    const account = useAppSelector((state) => state.auth.account);
    const [profileImage, setProfileImage] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [realName, setRealName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (account) {
            if (account.email) setEmail(account.email);
            if (account.real_name) setRealName(account.real_name);
            if (account.bio) setBio(account.bio);
        }
    }, [dispatch]);

    const onSubmit = () => {
        // TODO
    }

    if (!account) return <div>Error!</div>;
    else {
        return (
            <Container style={{ maxWidth: 400 }} className="mt-3">
                <h4 className="mb-3">Profile Settings</h4>
                <Form>
                    <Form.Group>
                        <Form.Label>Profile Image</Form.Label>
                        <Form.Control id="change-profile-image-input" type="file" value={profileImage} onChange={({target}) => setProfileImage(target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                            <Form.Control id="change-email-input" value={email} onChange={({target}) => setEmail(target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                            <Form.Control id="change-real-name-input" value={realName} onChange={({target}) => setRealName(target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control id="change-password-input" type="password" value={password}  onChange={({target}) => setPassword(target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control id="change-bio-input" as="textarea" value={bio} onChange={({target}) => setBio(target.value)} />
                    </Form.Group>
                    <Button id="submit-button" onClick={onSubmit} >Save changes</Button>
                </Form>
            </Container>
        );
    }
}
