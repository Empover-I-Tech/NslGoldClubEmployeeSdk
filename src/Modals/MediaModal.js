import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Linking,
} from "react-native";

import Video from "react-native-video";
import { WebView } from "react-native-webview";
import ReactNativePdf from 'react-native-pdf';

const { width, height } = Dimensions.get("window");

const MediaModal = ({ visible, link, onClose, loaderColor = "#0000ff" }) => {

    const [loadingContent, setLoadingContent] = useState(true);

    /* ---------- Safe Link ---------- */
    const safeLink = link || "";


    /* ---------- Detect Types ---------- */

    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(safeLink);
    const isMp4 = /\.mp4$/i.test(safeLink);
    const isPdf = /\.pdf$/i.test(safeLink);
    const pdfRef = useRef(null);
    const isYouTube =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(safeLink);

    const isWeb = !isImage && !isMp4 && !isPdf && !isYouTube;


    /* ---------- Hooks (ALWAYS SAME ORDER) ---------- */

    useEffect(() => {
        setLoadingContent(true);
    }, [safeLink, visible]);


    useEffect(() => {
        if (visible && isYouTube && safeLink) {
            openYoutube();
        }
    }, [visible, isYouTube, safeLink]);


    /* ---------- Helpers ---------- */

    const openYoutube = async () => {
        try {
            let url = safeLink.trim();

            if (!url.startsWith("http")) {
                url = "https://" + url;
            }

            await Linking.openURL(url);
            onClose();

        } catch (error) {
            console.log("YouTube Open Error:", error);
        }
    };


    const getPdfUrl = (url) => {
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            url
        )}`;
    };


    /* ---------- Size ---------- */

    const contentWidth = width * 0.95;
    const contentHeight = height * 0.85;


    /* ---------- UI ---------- */

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>

                <View
                    style={[
                        styles.contentWrapper,
                        { width: contentWidth, height: contentHeight },
                    ]}
                >

                    {/* Close */}
                    <TouchableOpacity
                        style={styles.innerCloseBtn}
                        onPress={onClose}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>


                    {/* No Link Message */}
                    {!safeLink && (
                        <Text style={{ textAlign: "center", marginTop: 40 }}>
                            No media available
                        </Text>
                    )}


                    {/* Loader */}
                    {loadingContent && safeLink && (
                        <ActivityIndicator
                            size="large"
                            color={loaderColor}
                            style={styles.loader}
                        />
                    )}


                    {/* IMAGE */}
                    {isImage && (
                        <Image
                            source={{ uri: safeLink }}
                            style={styles.media}
                            resizeMode="contain"
                            onLoadEnd={() => setLoadingContent(false)}
                        />
                    )}


                    {/* VIDEO */}
                    {isMp4 && (
                        <Video
                            source={{ uri: safeLink }}
                            style={styles.media}
                            controls
                            resizeMode="contain"

                            onLoad={() => setLoadingContent(false)}

                            onError={(e) => {
                                console.log("Video Error:", e);
                                setLoadingContent(false);
                            }}

                            onBuffer={({ isBuffering }) =>
                                setLoadingContent(isBuffering)
                            }
                        />
                    )}


                    {/* PDF */}
                    {isPdf && (
                        // <WebView
                        //     source={{ uri: getPdfUrl(safeLink) }}
                        //     style={styles.media}
                        //     onLoadEnd={() => setLoadingContent(false)}
                        // />

                        <ReactNativePdf
                            // ref={pdfRef}
                            source={
                                { uri: safeLink, cache: true, type: 'url' }
                            }
                            trustAllCerts={false}
                            scale={1.0}
                            minScale={1.0}
                            maxScale={3.0}
                            fitPolicy={2}
                            spacing={4}
                            enablePaging={false}
                            style={{ flex: 1, width: '100%', height: '100%' }}
                            onLoadProgress={(percent) => {
                                console.log(`PDF Loading: ${percent}%`);
                            }}
                            onLoadComplete={(pages) => {
                                setLoadingContent(false);
                                console.log(`PDF Loaded: ${pages} pages`);

                            }}
                            onError={(error) => {
                                setLoadingContent(false);
                                console.log('Failed to load PDF:', error);
                            }}
                        />
                    )}


                    {/* WEB */}
                    {isWeb && safeLink && (
                        <WebView
                            source={{ uri: safeLink }}
                            style={styles.media}
                            onLoadEnd={() => setLoadingContent(false)}
                        />
                    )}

                </View>
            </View>
        </Modal>
    );
};


export default MediaModal;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    contentWrapper: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },

    innerCloseBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    closeText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    loader: {
        position: "absolute",
        zIndex: 30,
        alignSelf: "center",
        top: "45%",
    },

    media: {
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
    },
});
