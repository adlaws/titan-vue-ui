<template>
    <cse-desktop-window
        title="Hello World"
        icon="hand"
        :x="0"
        :y="100"
        :width="275"
        :height="160"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <h1>Hello World</h1>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>
