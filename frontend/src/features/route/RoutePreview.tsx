import {
    GoogleMap, InfoBox, InfoWindow, Marker, Polyline, useJsApiLoader, useGoogleMap,
} from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import {
    Badge, Button, Image, Modal,
} from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import * as env from "dotenv";
import { IRepository, IRoute } from "../../common/Interfaces";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./routeSlice";
import { toBeLoaded } from "../repository/reposSlice";
import "./RoutePreview.css";
import marker from "../../common/assets/marker.gif";
import Travel from "./popup/Travel";

env.config();

interface RoutePreviewProps {

}

export default function RoutePreview(props : RoutePreviewProps) {
    const isMapLoaded = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY as string,
    }).isLoaded;

    const [isLoading, hasError, route] = useSelector<RootState, [boolean, boolean, IRoute|null]>((state) =>
        [state.route.isLoading, state.route.hasError, state.route.currentRoute]);
    const repo = useSelector<RootState, IRepository>((state) => state.repos.currentRepo as IRepository);
    const [overPlace, setOverPlace] = useState<number|null>(null);
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string}>();
    const [map, setMap] = useState<any>(null);
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        if (!route || route.repo_id !== parseInt(params.id)) {
            dispatch(actionCreators.fetchRoute(parseInt(params.id)));
        }
    }, [dispatch]);

    function fork() {
        dispatch(toBeLoaded(null));
        history.push(
            "/repos/create",
            {
                repo_id: (route as IRoute).repo_id,
                region_name: (`${repo.repo_name} (${(route as IRoute).region.region_address})`),
            },
        );
    }

    if (isLoading || !isMapLoaded || hasError) return null;
    if (!route) return <div>Fatal Error!</div>;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Route</h4>
                <div>
                    <Button
                        className="m-2"
                        id="fork-route-button"
                        onClick={fork}
                    >
                        Fork
                    </Button>
                    <Button
                        className="m-2"
                        id="place-detail-button"
                        onClick={() => history.push(`/repos/${params.id}/place`)}
                    >
                        View Detail
                    </Button>
                    <Button
                        className="m-2"
                        id="travel-button"
                        onClick={() => setShow(true)}
                    >
                        Travel
                    </Button>
                </div>
            </div>
            <div className="m-2">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "300px" }}
                    onLoad={(map) => {
                        const sw = new window.google.maps.LatLng(route.region.south, route.region.west);
                        const ne = new window.google.maps.LatLng(route.region.north, route.region.east);
                        const bounds = new window.google.maps.LatLngBounds(sw, ne);
                        map.fitBounds(bounds);
                        setMap(map);
                    }}
                    center={new window.google.maps.LatLng(route.region.latitude, route.region.longitude)}
                    zoom={8}
                >
                    {route.places.map((value) => (
                        <React.Fragment key={value.place_id.toString()}>
                            <Marker
                                icon={marker}
                                position={{ lat: value.latitude, lng: value.longitude }}
                                onMouseOver={() => setOverPlace(value.place_id)}
                                onMouseOut={() => {
                                    if (overPlace === value.place_id) setOverPlace(null);
                                }}
                            >
                                { overPlace && overPlace === value.place_id && (
                                    <div
                                        className="route-thumbnail"
                                        style={{
                                            width: "100px",
                                            zIndex: 10000,
                                            position: "absolute",
                                            top: `${100 *
                                            ((value.latitude - map.getBounds()?.getNorthEast().lat()) /
                                            (map.getBounds()?.getSouthWest().lat() -
                                            map.getBounds()?.getNorthEast().lat()))}%`,
                                            left: `${100 *
                                            ((value.longitude - map.getBounds()?.getSouthWest().lng()) /
                                            (map.getBounds()?.getNorthEast().lng() -
                                            map.getBounds()?.getSouthWest().lng()))}%`,
                                            transform: value.thumbnail ?
                                                "translate(-50%, -150%)" : "translate(-50%, -300%)",
                                        }}
                                    >
                                        <Badge
                                            className="mx-auto route-badge"
                                            style={{
                                                width: "fit-content",
                                                display: "block",
                                                borderRadius: value.thumbnail ? "10px 10px 0 0" : "",
                                            }}
                                        >
                                            {value.place_name}
                                        </Badge>
                                        {value.thumbnail && (
                                            <Image
                                                className="route-image"
                                                src={value.thumbnail}
                                                alt={value.thumbnail}
                                                thumbnail
                                            />
                                        )}
                                    </div>
                                )}
                            </Marker>
                        </React.Fragment>
                    ))}
                    <Polyline
                        path={(route as IRoute).places.map((value) => ({ lat: value.latitude, lng: value.longitude }))}
                        options={{
                            strokeColor: "#880088",
                            strokeOpacity: 1,
                            strokeWeight: 1,
                        }}
                    />
                </GoogleMap>
            </div>
            <Travel repo_id={parseInt(params.id)} show={show} setShow={setShow} />
        </div>
    );
}
