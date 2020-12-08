<template>
    <svg
        ref="container"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 40"
        :width="size"
    >
        <defs>
            <pattern
                id="compass"
                :x="tweenedCompassRotation"
                y="0"
                width="360"
                height="40"
                patternUnits="userSpaceOnUse"
            >
                <g :fill="color" :opacity="opacity">
                    <path v-if="inverted" d="M0 0h1.5v20H0zm45.25 0h1v10h-1zM90 0h1.5v20H90zM10.5 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zM1.63 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zM186 21h2.25v15h-2.67L175.5 24v12h-2.25V21h2.67L186 33zm92.37 3.25h-11.5v4.12h9.25v2.25h-9.24v4.13h11.5V37h-13.75V22h13.74zM135.25 0h1v10h-1zM100.5 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zM91.63 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm.37 0h1.5v20H180zm45.25 0h1v10h-1zM270 0h1.5v20H270zm-79.5 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm-78.87 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm45.62 0h1v10h-1zM280.5 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm10 0h.5v5h-.5zm-78.87 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm2 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v2.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zm1 0h.25v1.5h-.25zM368.25 25.58H366v-.87q0-.19-.15-.31-.12-.15-.3-.15h-9.6q-.18 0-.32.15-.13.12-.13.3v3.22q0 .18.13.33.14.12.33.12h9.58q.56 0 1.04.21.5.21.88.59.37.37.58.87.21.48.21 1.04v3.21q0 .56-.2 1.06-.22.48-.6.86-.37.37-.87.58-.48.21-1.04.21h-9.58q-.56 0-1.06-.2-.48-.22-.86-.6-.37-.37-.58-.85-.21-.5-.21-1.06v-.87h2.25v.87q0 .19.13.33.14.13.33.13h9.58q.19 0 .31-.13.15-.14.15-.33v-3.2q0-.2-.15-.32-.12-.15-.3-.15h-9.6q-.55 0-1.05-.2-.48-.21-.86-.59-.37-.37-.58-.85-.21-.5-.21-1.06V24.7q0-.56.2-1.04.22-.5.6-.88.37-.37.85-.58.5-.21 1.06-.21h9.58q.56 0 1.04.2.5.22.88.6.37.37.58.87.21.48.21 1.04zM102.3 22l-5.46 15h-1.83l-4.27-11.69L86.49 37l-.04-.02.02.02h-1.81L79.2 22h2.4l3.97 10.94L89.55 22h2.4l3.98 10.94L99.9 22zm122.04-11h1.13v7.5h-1.33l-5.05-6v6h-1.12V11h1.33l5.04 6zm9.19 1.13h-5.75v2.06h4.63v1.12h-4.63v2.07h5.75v1.12h-6.87V11h6.87zm81.97.67h-1.13v-.45q0-.09-.07-.15-.07-.07-.16-.07h-4.8q-.09 0-.16.07-.06.06-.06.15v1.6q0 .1.06.18.07.06.17.06h4.79q.28 0 .52.1.25.1.44.3.19.18.29.43.1.24.1.52v1.6q0 .29-.1.54-.1.24-.3.42-.18.2-.43.3-.24.1-.52.1h-4.8q-.27 0-.52-.1-.24-.1-.43-.3-.19-.18-.3-.42-.1-.25-.1-.53v-.44h1.13v.44q0 .09.06.16.07.07.17.07h4.79q.1 0 .16-.07.07-.07.07-.16v-1.6q0-.1-.07-.16-.07-.08-.16-.08h-4.8q-.27 0-.52-.1-.24-.1-.43-.3-.19-.18-.3-.42-.1-.25-.1-.53v-1.6q0-.29.1-.53.11-.25.3-.43.19-.2.43-.3.25-.1.53-.1h4.79q.28 0 .52.1.25.1.44.3.19.18.29.43.1.24.1.52zm8-.67h-5.74v2.06h4.62v1.12h-4.62v2.07h5.75v1.12h-6.88V11h6.88zm-280.17.67H42.2v-.45q0-.09-.07-.15-.06-.07-.16-.07h-4.79q-.1 0-.17.07-.06.06-.06.15v1.6q0 .1.06.18.08.06.17.06h4.8q.27 0 .51.1.25.1.44.3.19.18.3.43.1.24.1.52v1.6q0 .29-.1.54-.11.24-.3.42-.19.2-.44.3-.24.1-.52.1h-4.79q-.28 0-.53-.1-.24-.1-.43-.3-.19-.18-.29-.42-.1-.25-.1-.53v-.44h1.12v.44q0 .09.06.16.08.07.17.07h4.8q.09 0 .15-.07.07-.07.07-.16v-1.6q0-.1-.07-.16-.06-.08-.16-.08h-4.79q-.28 0-.53-.1-.24-.1-.43-.3-.19-.18-.29-.42-.1-.25-.1-.53v-1.6q0-.29.1-.53.1-.25.3-.43.18-.2.42-.3.25-.1.53-.1h4.8q.27 0 .51.1.25.1.44.3.19.18.3.43.1.24.1.52zM55.67 11l-2.72 7.5h-.92l-2.14-5.84-2.12 5.84-.02-.01v.01h-.9L44.12 11h1.2l1.99 5.47L49.3 11h1.2l1.99 5.47L54.48 11zm76.45 0h1.13v7.5h-1.33l-5.05-6v6h-1.12V11h1.33l5.04 6zm13.63 0l-2.73 7.5h-.92l-2.13-5.84-2.13 5.84-.02-.01.01.01h-.9L134.2 11h1.2l1.99 5.47 1.99-5.47h1.2l1.98 5.47 2-5.47zM8.25 25.58H6v-.87q0-.19-.15-.31-.12-.15-.3-.15h-9.6q-.18 0-.32.15-.13.12-.13.3v3.22q0 .18.13.33.14.12.33.12h9.58q.56 0 1.04.21.5.21.88.59.37.37.58.87.21.48.21 1.04v3.21q0 .56-.2 1.06-.22.48-.6.86-.37.37-.87.58-.48.21-1.04.21h-9.58q-.56 0-1.06-.2-.48-.22-.86-.6-.37-.37-.58-.85-.21-.5-.21-1.06v-.87h2.25v.87q0 .19.13.33.14.13.33.13h9.58q.19 0 .31-.13.15-.14.15-.33v-3.2q0-.2-.15-.32-.12-.15-.3-.15h-9.6q-.55 0-1.05-.2-.48-.21-.86-.59-.37-.37-.58-.85-.21-.5-.21-1.06V24.7q0-.56.2-1.04.22-.5.6-.88.37-.37.85-.58.5-.21 1.06-.21h9.58q.56 0 1.04.2.5.22.88.6.37.37.58.87.21.48.21 1.04z" />
                    <path v-else d="M186 4h2.25v15h-2.67L175.5 7v12h-2.25V4h2.67L186 16zM278.37 6.25h-11.5v4.13h9.25v2.25h-9.24v4.12h11.5V19h-13.75V4h13.74zM0 40h1.5V20H0zm45.25 0h1V30h-1zM90 40h1.5V20H90zm-79.5 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zM1.63 40h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm45.62 0h1V30h-1zm-34.75 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm-78.87 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm.37 0h1.5V20H180zm45.25 0h1V30h-1zM270 40h1.5V20H270zm-79.5 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm-78.87 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm45.62 0h1V30h-1zm-34.75 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm10 0h.5v-5h-.5zm-78.87 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm2 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-2.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zm1 0h.25v-1.5h-.25zM368.25 7.58H366v-.87q0-.19-.15-.31-.12-.15-.3-.15h-9.6q-.18 0-.32.15-.13.12-.13.3v3.22q0 .18.13.33.14.13.33.13h9.58q.56 0 1.04.2.5.21.88.59.37.37.58.87.21.48.21 1.04v3.21q0 .56-.2 1.06-.22.48-.6.86-.37.37-.87.58-.48.21-1.04.21h-9.58q-.56 0-1.06-.2-.48-.22-.86-.6-.37-.37-.58-.85-.21-.5-.21-1.06v-.87h2.25v.87q0 .19.13.34.14.12.33.12h9.58q.19 0 .31-.12.15-.15.15-.34v-3.2q0-.2-.15-.32-.12-.14-.3-.14h-9.6q-.55 0-1.05-.21-.48-.21-.86-.59-.37-.37-.58-.85-.21-.5-.21-1.06V6.7q0-.56.2-1.04.22-.5.6-.88.37-.37.85-.58.5-.21 1.06-.21h9.58q.56 0 1.04.2.5.22.88.6.37.37.58.87.21.48.21 1.04zM102.3 4l-5.46 15h-1.83L90.74 7.31 86.49 19l-.04-.02.02.02h-1.81L79.2 4h2.4l3.97 10.94L89.55 4h2.4l3.98 10.94L99.9 4zM224.34 21.5h1.13V29h-1.33l-5.05-6v6h-1.12v-7.5h1.33l5.04 6zm9.19 1.12h-5.75v2.07h4.63v1.12h-4.63v2.06h5.75V29h-6.87v-7.5h6.87zm81.97.68h-1.13v-.45q0-.09-.07-.15-.07-.08-.16-.08h-4.8q-.09 0-.16.08-.06.06-.06.15v1.6q0 .1.06.17.07.07.17.07h4.79q.28 0 .52.1.25.1.44.3.19.18.29.43.1.24.1.52v1.6q0 .29-.1.54-.1.24-.3.42-.18.2-.43.3-.24.1-.52.1h-4.8q-.27 0-.52-.1-.24-.1-.43-.3-.19-.18-.3-.42-.1-.25-.1-.53v-.44h1.13v.44q0 .09.06.16.07.06.17.06h4.79q.1 0 .16-.06.07-.07.07-.16v-1.6q0-.1-.07-.16-.07-.08-.16-.08h-4.8q-.27 0-.52-.1-.24-.1-.43-.3-.19-.18-.3-.42-.1-.25-.1-.53v-1.6q0-.29.1-.53.11-.25.3-.43.19-.2.43-.3.25-.1.53-.1h4.79q.28 0 .52.1.25.1.44.3.19.18.29.43.1.24.1.52zm8-.68h-5.74v2.07h4.62v1.12h-4.62v2.06h5.75V29h-6.88v-7.5h6.88zm-280.17.68H42.2v-.45q0-.09-.07-.15-.06-.08-.16-.08h-4.79q-.1 0-.17.08-.06.06-.06.15v1.6q0 .1.06.17.08.07.17.07h4.8q.27 0 .51.1.25.1.44.3.19.18.3.43.1.24.1.52v1.6q0 .29-.1.54-.11.24-.3.42-.19.2-.44.3-.24.1-.52.1h-4.79q-.28 0-.53-.1-.24-.1-.43-.3-.19-.18-.29-.42-.1-.25-.1-.53v-.44h1.12v.44q0 .09.06.16.08.06.17.06h4.8q.09 0 .15-.06.07-.07.07-.16v-1.6q0-.1-.07-.16-.06-.08-.16-.08h-4.79q-.28 0-.53-.1-.24-.1-.43-.3-.19-.18-.29-.42-.1-.25-.1-.53v-1.6q0-.29.1-.53.1-.25.3-.43.18-.2.42-.3.25-.1.53-.1h4.8q.27 0 .51.1.25.1.44.3.19.18.3.43.1.24.1.52zm12.34-1.8L52.95 29h-.92l-2.14-5.84L47.77 29l-.02-.01V29h-.9l-2.73-7.5h1.2l1.99 5.47 1.99-5.47h1.2l1.99 5.47 1.99-5.47zm76.45 0h1.13V29h-1.33l-5.05-6v6h-1.12v-7.5h1.33l5.04 6zm13.63 0l-2.73 7.5h-.92l-2.13-5.84-2.13 5.84-.02-.01.01.01h-.9l-2.73-7.5h1.2l1.99 5.47 1.99-5.47h1.2l1.98 5.47 2-5.47zM8.25 7.58H6v-.87q0-.19-.15-.31-.12-.15-.3-.15h-9.6q-.18 0-.32.15-.13.12-.13.3v3.22q0 .18.13.33.14.13.33.13h9.58q.56 0 1.04.2.5.21.88.59.37.37.58.87.21.48.21 1.04v3.21q0 .56-.2 1.06-.22.48-.6.86-.37.37-.87.58-.48.21-1.04.21h-9.58q-.56 0-1.06-.2-.48-.22-.86-.6-.37-.37-.58-.85-.21-.5-.21-1.06v-.87h2.25v.87q0 .19.13.34.14.12.33.12h9.58q.19 0 .31-.12.15-.15.15-.34v-3.2q0-.2-.15-.32-.12-.14-.3-.14h-9.6q-.55 0-1.05-.21-.48-.21-.86-.59-.37-.37-.58-.85-.21-.5-.21-1.06V6.7q0-.56.2-1.04.22-.5.6-.88.37-.37.85-.58.5-.2 1.06-.2h9.58q.56 0 1.04.2.5.22.88.6.37.37.58.87.21.48.21 1.04z" />
                </g>
            </pattern>
        </defs>
        <g :fill="needle" :opacity="opacity">
            <path v-if="inverted" d="M185.37 40h-9.24l4.62-8z" />
            <path v-else d="M185.37 0h-9.24l4.62 8z" />
        </g>
        <rect
            x="0"
            y="0"
            width="360"
            height="40"
            fill="url(#compass)"
        />
    </svg>
</template>

<script>
import gsap from 'gsap'; // provides tweening functions

import MathUtils from '@/assets/js/utils/math-utils.js';
import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';

const DEFAULT_UPDATE_INTERVAL_MS = 125; // update every 125ms (8x per second)
const MIN_UPDATE_INTERVAL = 100; // at most update 10x per second

export default {
    name: 'linear-compass',
    props:
    {
        updateInterval:{
            type: Number,
            default: DEFAULT_UPDATE_INTERVAL_MS,
        },
        color:
        {
            type: String,
            default: '#000',
        },
        needle:
        {
            type: String,
            default: '#F00',
        },
        opacity:
        {
            type: Number,
            default: 1.0,
        },
        size:
        {
            type: Number,
            default: 360,
        },
        inverted:
        {
            type: [Boolean, String],
            default: false,
        },
        x:
        {
            type: [Number, String],
            default: 'center',
        },
        y:
        {
            type: [Number, String],
            default: 'top',
        },
    },
    data()
    {
        return {
            magneticHeading: 0, // between -180.0 and 180.0
            compassRotation: 0.0,
            tweenedCompassRotation: 0.0,
            updateIntervalMs: DEFAULT_UPDATE_INTERVAL_MS,
            updateIntervalSeconds: (DEFAULT_UPDATE_INTERVAL_MS/1000.0),
            updateTimer: null,
            running: false,
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; },
    },
    watch:
    {
        desktopBounds: function() { this.updatePosition(); },
        updateInterval() { this.updateAllRates(); },
        x: function() { this.updatePosition(); },
        y: function() { this.updatePosition(); },
        magneticHeading(newHeading, oldHeading)
        {
            // this is simply to ensure that the compass needle rotates via the "shortest angular
            // distance" so that when the needle goes from, say 359° to 1°, it spins clockwise
            // through 360°, rather than counter-clockwise through 180°
            const delta = MathUtils.shortestAngleDeg(oldHeading, newHeading);
            this.compassRotation += delta;
            // ease the compass heading value to provide the illusion of continuous updates
            this.easeValue({tweenedCompassRotation: this.compassRotation});
        },
    },
    mounted()
    {
        this.updatePosition();
        // start the update cycle
        this.running = true;
        this.updateHeading();
    },
    beforeDestroy()
    {
        this.stopUpdates();
    },
    methods:
    {
        updatePosition()
        {
            const container = this.$refs.container;
            const containerBounds = container.getBoundingClientRect();

            container.style.position = 'absolute';

            if(typeof this.x === 'number')
                container.style.left = MathUtils.clamp(this.x, this.desktopBounds.left, this.desktopBounds.right-containerBounds.width) + 'px';
            else
            {
                if(this.x === 'left')
                    container.style.left = this.desktopBounds.left + 'px';
                else if(this.x === 'right')
                    container.style.left = (this.desktopBounds.right - containerBounds.width) + 'px';
                else // center
                    container.style.left = (this.desktopBounds.left + ((this.desktopBounds.w - containerBounds.width)/2)) + 'px';
            }

            if(typeof this.y === 'number')
                container.style.top = MathUtils.clamp(this.y, this.desktopBounds.top, this.desktopBounds.bottom-containerBounds.height) + 'px';
            else
            {
                if(this.y === 'top')
                    container.style.top = this.desktopBounds.top + 'px';
                else if(this.y === 'bottom')
                    container.style.top = (this.desktopBounds.bottom - containerBounds.height) + 'px';
                else // center
                    container.style.top = (this.desktopBounds.top + ((this.desktopBounds.h - containerBounds.height)/2)) + 'px';
            }
        },
        updateHeading()
        {
            if(!this.running)
                return;

            if($isInsideTitan)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                    this.magneticHeading = scenarioCamera.getMagNorthHeading(0); // between -180.0 and 180.0
            }
            else
            {
                this.magneticHeading = 45.67;// MathUtils.wrapClamp(this.magneticHeading + (Math.random() * 10.0) -5, -180.0, 180.0);
            }

            this.updateTimer = setTimeout(this.updateHeading, Math.max(MIN_UPDATE_INTERVAL, this.updateIntervalMs));
        },
        updateAllRates()
        {
            this.updateIntervalMs = Math.max(MIN_UPDATE_INTERVAL, this.updateInterval);
            this.updateIntervalSeconds = this.updateIntervalMs/1000.0;
        },
        stopUpdates()
        {
            this.running = false;
            if(this.updateTimer !== null)
            {
                clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        },
        easeValue(params)
        {
            gsap.to(this.$data, { duration: this.updateIntervalSeconds, ease: 'none', ...params });
        },
    }
};
</script>
