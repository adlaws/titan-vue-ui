<template>
    <titan-window
        title="Hello World"
        icon="hand"
        :x="0"
        :y="100"
        :width="275"
        :height="160"
    >
        <template #default="context">
            <titan-window-content :window-context="context.windowContext">
                <h1>Hello World</h1>
            </titan-window-content>
        </template>
    </titan-window>
</template>
