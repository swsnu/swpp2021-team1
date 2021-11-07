import { createAsyncThunk } from "@reduxjs/toolkit";
import React from "react";
import { ListGroup, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { getFriends } from "../../../common/APIs";
import { IUser } from "../../../common/Interfaces";
import Friend from "../Friend";


interface FriendListProps {
    modalShow: boolean
}



export default function FriendList(props : FriendListProps) {
    const { modalShow } = props;
    return (
        <Modal show={props.modalShow} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {currentUser && currentUser.real_name ? currentUser.real_name : ""}'s friends
                </Modal.Title>
                <Modal.Body>
                    <ListGroup>
                        {props.friendList.map((friend) => <Friend friend={friend} />)}
                    </ListGroup>
                </Modal.Body>
            </Modal.Header>
        </Modal>
    );
}
