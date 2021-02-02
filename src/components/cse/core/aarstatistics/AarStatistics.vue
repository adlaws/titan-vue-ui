<template>
    <cse-desktop-window
        title="AAR Statistics"
        icon="chart-bar-stacked"
        :x="50"
        :y="175"
        :width="1200"
        :min-width="1200"
        :height="545"
        :resizable="true"
        :closable="false"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <b-tabs
                    v-model="tabs.current"
                >
                    <b-tabs-slider color="accent" />
                    <b-tab-item key="Units">
                        {{ $t('aarStatistics.units.Units', languageID) }}
                    </b-tab-item>
                    <b-tab-item key="Groups">
                        {{ $t('aarStatistics.groups.Groups', languageID) }}
                    </b-tab-item>
                    <b-tab-item key="Battle Seeds">
                        {{ $t('aarStatistics.battleSeeds.Battle Seeds', languageID) }}
                    </b-tab-item>
                    <b-tab-item key="Win/Lose Conditions">
                        {{ $t('aarStatistics.winLoseConditions.Win/Lose Conditions', languageID) }}
                    </b-tab-item>
                </b-tabs>

                <b-tabs-items
                    v-model="tabs.current"
                >
                    <b-tab-item
                        key="Units"
                    >
                        <b-spacer />
                        <b-input
                            v-model="tables.units.search"
                            append-icon="magnify"
                            label="Search"
                            single-line
                            hide-details
                            clearable
                        />
                        <b-table
                            dense
                            class="mb-5"
                            :items="tables.units.items"
                            :headers="tables.units.headers"
                            :footer-props="tables.units.footerprops"
                            :custom-sort="_unitsTableSort"
                            :search="tables.units.search"
                        >
                            <template v-slot:[`item.alliance`]="{ item }">
                                <b-icon
                                    icon="triangle"
                                    :color="item.alliance==='blufor'?'#08f':'red'"
                                />
                            </template>
                            <template v-slot:[`item.pctHit`]="{ item }">
                                {{ parseFloat((item.hits/item.fired*100.0).toFixed(2)) }}%
                            </template>
                            <template v-slot:[`item.minHitRange`]="{ item }">
                                {{ item.minHitRange }}m
                            </template>
                            <template v-slot:[`item.maxHitRange`]="{ item }">
                                {{ item.maxHitRange }}m
                            </template>
                            <template v-slot:[`item.avgHitRange`]="{ item }">
                                {{ parseFloat((item.maxHitRange-item.minHitRange)/2).toFixed(2) }}m
                            </template>
                            <template v-slot:[`item.pctHealth`]="{ item }">
                                {{ parseFloat((item.pctHealth*100).toFixed(2)) }}%
                            </template>
                        </b-table>
                        <b-form
                            class="mt-2"
                        >
                            <div class="columns">
                                <div class="column is-8" />
                                <div class="column is-3">
                                    <b-input
                                        v-model="exportFile.filename"
                                        class="input-align-right"
                                        label="File"
                                    >
                                        <template v-slot:append-outer>
                                            <b-dropdown
                                                v-model="exportFile.format"
                                                label="Format"
                                                :items="[{text:'.json',value:'json'}, {text:'.csv',value:'csv'}]"
                                            />
                                        </template>
                                    </b-input>
                                </div>
                                <div class="column is-1">
                                    <b-button
                                        small
                                    >
                                        Export
                                    </b-button>
                                </div>
                            </div>
                        </b-form>
                    </b-tab-item>
                    <b-tab-item
                        key="Groups"
                    >
                        Groups
                    </b-tab-item>
                    <b-tab-item
                        key="Battle Seeds"
                    >
                        Battle Seeds
                    </b-tab-item>
                    <b-tab-item
                        key="Win/Lose Conditions"
                    >
                        Win/Lose Conditions
                    </b-tab-item>
                </b-tabs-items>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';

export default {
    name: 'aar-statistics',
    components:
    {
        CseDesktopWindow, CseDesktopWindowContent,
    },
    data()
    {
        return {
            exportFile:
            {
                filename:'aar-statistics',
                format:'json',
            },
            tabs:
            {
                current: 'Units',
            },
            tables:
            {
                units:
                {
                    page: 1,
                    options: {
                        page: 0,
                        itemsPerPage: 25,
                    },
                    headers:[
                        { value: 'name', text: 'Name', sortable: true, align: 'start', width: "1%", cellClass:'ellipsis-overflow' },
                        { value: 'alliance', text: 'Alliance', sortable: true, align: 'start', width: "1%", },
                        { value: 'fired', text: 'Fired', sortable: true, align: 'start', width: "1%", },
                        { value: 'hits', text: 'Hits', sortable: true, align: 'start', width: "1%", },
                        { value: 'pctHit', text: '% Hit', sortable: true, align: 'start', width: "1%", },
                        { value: 'wounds', text: 'Wounds', sortable: true, align: 'start', width: "1%", },
                        { value: 'kills', text: 'Kills', sortable: true, align: 'start', width: "1%", },
                        { value: 'minHitRange', text: 'Min. Hit Range', sortable: true, align: 'start', width: "1%", },
                        { value: 'maxHitRange', text: 'Max. Hit Range', sortable: true, align: 'start', width: "1%", },
                        { value: 'avgHitRange', text: 'Avg. Hit Range', sortable: true, align: 'start', width: "1%", },
                        { value: 'fuel', text: 'Fuel', sortable: true, align: 'start', width: "1%", },
                        { value: 'ammo', text: 'Ammo', sortable: true, align: 'start', width: "1%", },
                        { value: 'pctHealth', text: '% Health', sortable: true, align: 'start', width: "1%", },
                        { value: 'bleeding', text: 'Bleeding', sortable: true, align: 'start', width: "1%", },
                        { value: 'killerStation', text: 'Killer Station', sortable: true, align: 'start', width: "1%", },
                        { value: 'killerEntity', text: 'Killer Entity', sortable: true, align: 'start', width: "1%", },
                    ],
                    footerprops:
                    {
                        'items-per-page-options':[5,10,25,50,100],
                    },
                    selected: [],
                    search: '',
                    items:[
                        { name:'Myrtle', alliance:'opfor', fired:843, hits:11, wounds:5, kills:9, minHitRange:8608, maxHitRange:7162, fuel:23, ammo:21, pctHealth:0.5274, bleeding:0.4725, killerStation:'Tommy', killerEntity:'Paul',},
                        { name:'Ernest', alliance:'opfor', fired:194, hits:40, wounds:17, kills:33, minHitRange:6909, maxHitRange:2123, fuel:66, ammo:5, pctHealth:0.2828, bleeding:0.5363, killerStation:'Cecilia', killerEntity:'Francis',},
                        { name:'Frances', alliance:'blufor', fired:272, hits:92, wounds:18, kills:88, minHitRange:3753, maxHitRange:593, fuel:86, ammo:11, pctHealth:0.0327, bleeding:0.2177, killerStation:'Frank', killerEntity:'Raymond',},
                        { name:'Edgar', alliance:'opfor', fired:337, hits:91, wounds:4, kills:17, minHitRange:5306, maxHitRange:5380, fuel:56, ammo:17, pctHealth:0.9476, bleeding:0.1947, killerStation:'Carrie', killerEntity:'Rachel',},
                        { name:'Lola', alliance:'opfor', fired:476, hits:63, wounds:63, kills:44, minHitRange:8334, maxHitRange:6231, fuel:15, ammo:49, pctHealth:0.0501, bleeding:0.6751, killerStation:'Russell', killerEntity:'Abbie',},
                        { name:'Christian', alliance:'opfor', fired:68, hits:2, wounds:81, kills:30, minHitRange:728, maxHitRange:5933, fuel:75, ammo:49, pctHealth:0.695, bleeding:0.8597, killerStation:'Adelaide', killerEntity:'Emma',},
                        { name:'Lottie', alliance:'blufor', fired:957, hits:13, wounds:74, kills:32, minHitRange:1626, maxHitRange:6573, fuel:47, ammo:57, pctHealth:0.8863, bleeding:0.0001, killerStation:'Caleb', killerEntity:'Bruce',},
                        { name:'Addie', alliance:'blufor', fired:797, hits:49, wounds:50, kills:49, minHitRange:1118, maxHitRange:8809, fuel:58, ammo:84, pctHealth:0.1863, bleeding:0.1561, killerStation:'Jeanette', killerEntity:'Stella',},
                        { name:'Irene', alliance:'opfor', fired:474, hits:51, wounds:40, kills:44, minHitRange:3790, maxHitRange:9600, fuel:5, ammo:27, pctHealth:0.7582, bleeding:0.704, killerStation:'Tommy', killerEntity:'Francis',},
                        { name:'Brandon', alliance:'blufor', fired:54, hits:79, wounds:84, kills:75, minHitRange:9765, maxHitRange:5035, fuel:32, ammo:19, pctHealth:0.6072, bleeding:0.0708, killerStation:'Kathryn', killerEntity:'Garrett',},
                        { name:'Nora', alliance:'opfor', fired:542, hits:5, wounds:66, kills:25, minHitRange:8396, maxHitRange:2186, fuel:31, ammo:87, pctHealth:0.9361, bleeding:0.4126, killerStation:'Rose', killerEntity:'Dustin',},
                        { name:'Lizzie', alliance:'opfor', fired:454, hits:52, wounds:99, kills:80, minHitRange:4036, maxHitRange:684, fuel:87, ammo:26, pctHealth:0.7033, bleeding:0.3631, killerStation:'Millie', killerEntity:'Eunice',},
                        { name:'Adam', alliance:'blufor', fired:358, hits:97, wounds:63, kills:78, minHitRange:5511, maxHitRange:2620, fuel:56, ammo:77, pctHealth:0.2633, bleeding:0.522, killerStation:'Chester', killerEntity:'Lucinda',},
                        { name:'Jack', alliance:'blufor', fired:85, hits:38, wounds:63, kills:63, minHitRange:9307, maxHitRange:6451, fuel:91, ammo:29, pctHealth:0.381, bleeding:0.3197, killerStation:'Virginia', killerEntity:'Ryan',},
                        { name:'Olga', alliance:'opfor', fired:709, hits:95, wounds:25, kills:43, minHitRange:7925, maxHitRange:8704, fuel:50, ammo:46, pctHealth:0.1175, bleeding:0.4191, killerStation:'Kate', killerEntity:'Margaret',},
                        { name:'Leonard', alliancblu:'opfor', fired:259, hits:100, wounds:49, kills:84, minHitRange:5429, maxHitRange:3936, fuel:77, ammo:76, pctHealth:0.4755, bleeding:0.4174, killerStation:'Mattie', killerEntity:'Manuel',},
                        { name:'Jeanette', alliance:'opfor', fired:491, hits:25, wounds:75, kills:47, minHitRange:9390, maxHitRange:6836, fuel:37, ammo:39, pctHealth:0.9901, bleeding:0.005, killerStation:'Nathan', killerEntity:'Anne',},
                        { name:'Hallie', alliance:'opfor', fired:677, hits:45, wounds:48, kills:27, minHitRange:5668, maxHitRange:6528, fuel:34, ammo:9, pctHealth:0.0703, bleeding:0.6252, killerStation:'Luella', killerEntity:'Leo',},
                        { name:'Tony', alliance:'blufor', fired:350, hits:72, wounds:95, kills:24, minHitRange:9832, maxHitRange:9163, fuel:13, ammo:7, pctHealth:0.8027, bleeding:0.0647, killerStation:'Daisy', killerEntity:'Harriet',},
                        { name:'Dale', alliance:'opfor', fired:80, hits:74, wounds:8, kills:37, minHitRange:5686, maxHitRange:2207, fuel:99, ammo:97, pctHealth:0.5955, bleeding:0.5822, killerStation:'Devin', killerEntity:'Blake',},
                        { name:'Howard', alliance:'blufor', fired:596, hits:52, wounds:44, kills:36, minHitRange:5038, maxHitRange:9173, fuel:34, ammo:61, pctHealth:0.1479, bleeding:0.3404, killerStation:'Raymond', killerEntity:'Jean',},
                        { name:'Alejandro', alliance:'opfor', fired:297, hits:22, wounds:93, kills:9, minHitRange:8562, maxHitRange:3494, fuel:10, ammo:26, pctHealth:0.465, bleeding:0.3138, killerStation:'Philip', killerEntity:'Sophie',},
                        { name:'Christina', alliance:'opfor', fired:68, hits:63, wounds:77, kills:69, minHitRange:6546, maxHitRange:1497, fuel:81, ammo:12, pctHealth:0.9601, bleeding:0.6382, killerStation:'Matilda', killerEntity:'May',},
                        { name:'Chester', alliance:'blufor', fired:946, hits:49, wounds:83, kills:12, minHitRange:2225, maxHitRange:2893, fuel:88, ammo:59, pctHealth:0.3237, bleeding:0.186, killerStation:'Adeline', killerEntity:'Albert',},
                        { name:'Pearl', alliance:'opfor', fired:166, hits:67, wounds:51, kills:63, minHitRange:9618, maxHitRange:3557, fuel:83, ammo:88, pctHealth:0.8606, bleeding:0.2338, killerStation:'Gertrude', killerEntity:'Gerald',},
                        { name:'Olive', alliance:'blufor', fired:68, hits:32, wounds:75, kills:5, minHitRange:7628, maxHitRange:427, fuel:82, ammo:92, pctHealth:0.6809, bleeding:0.2615, killerStation:'Lelia', killerEntity:'Gabriel',},
                        { name:'Joshua', alliance:'opfor', fired:566, hits:70, wounds:39, kills:2, minHitRange:474, maxHitRange:1763, fuel:24, ammo:43, pctHealth:0.0691, bleeding:0.1599, killerStation:'Caleb', killerEntity:'Fanny',},
                        { name:'Roger', alliance:'blufor', fired:615, hits:49, wounds:21, kills:98, minHitRange:4315, maxHitRange:1834, fuel:97, ammo:24, pctHealth:0.874, bleeding:0.6495, killerStation:'Adam', killerEntity:'Antonio',},
                        { name:'Lola', alliance:'opfor', fired:559, hits:69, wounds:95, kills:55, minHitRange:8794, maxHitRange:8570, fuel:99, ammo:5, pctHealth:0.88, bleeding:0.8321, killerStation:'Edna', killerEntity:'Alberta',},
                        { name:'Jean', alliance:'opfor', fired:399, hits:43, wounds:89, kills:67, minHitRange:3680, maxHitRange:5531, fuel:38, ammo:45, pctHealth:0.1663, bleeding:0.3946, killerStation:'Clara', killerEntity:'Myra',},
                        { name:'Lela', alliance:'opfor', fired:304, hits:64, wounds:29, kills:8, minHitRange:4893, maxHitRange:9475, fuel:46, ammo:65, pctHealth:0.662, bleeding:0.4551, killerStation:'Flora', killerEntity:'Gussie',},
                        { name:'Daisy', alliance:'blufor', fired:209, hits:38, wounds:92, kills:54, minHitRange:9640, maxHitRange:7185, fuel:68, ammo:2, pctHealth:0.4454, bleeding:0.3897, killerStation:'Darrell', killerEntity:'Patrick',},
                        { name:'Helena', alliance:'opfor', fired:782, hits:6, wounds:11, kills:26, minHitRange:1553, maxHitRange:1476, fuel:81, ammo:2, pctHealth:0.2758, bleeding:0.6141, killerStation:'Madge', killerEntity:'Ethan',},
                        { name:'Frances', alliance:'opfor', fired:16, hits:24, wounds:64, kills:93, minHitRange:483, maxHitRange:5896, fuel:60, ammo:30, pctHealth:0.4979, bleeding:0.4764, killerStation:'Earl', killerEntity:'Hulda',},
                        { name:'Alan', alliance:'blufor', fired:810, hits:16, wounds:70, kills:31, minHitRange:5929, maxHitRange:1994, fuel:100, ammo:86, pctHealth:0.6376, bleeding:0.5205, killerStation:'Brandon', killerEntity:'Michael',},
                        { name:'Adelaide', alliance:'blufor', fired:57, hits:91, wounds:74, kills:56, minHitRange:118, maxHitRange:7562, fuel:20, ammo:31, pctHealth:0.0673, bleeding:0.5227, killerStation:'Verna', killerEntity:'Derek',},
                        { name:'Amanda', alliance:'opfor', fired:479, hits:81, wounds:25, kills:19, minHitRange:9585, maxHitRange:5221, fuel:94, ammo:57, pctHealth:0.8425, bleeding:0.221, killerStation:'Willie', killerEntity:'Susan',},
                        { name:'Troy', alliance:'blufor', fired:996, hits:32, wounds:88, kills:27, minHitRange:9243, maxHitRange:4021, fuel:25, ammo:75, pctHealth:0.3469, bleeding:0.1331, killerStation:'Etta', killerEntity:'Brett',},
                        { name:'Lloyd', alliance:'blufor', fired:920, hits:29, wounds:5, kills:41, minHitRange:3674, maxHitRange:8979, fuel:23, ammo:72, pctHealth:0.1358, bleeding:0.7219, killerStation:'Phoebe', killerEntity:'Howard',},
                        { name:'Kevin', alliance:'blufor', fired:336, hits:78, wounds:26, kills:99, minHitRange:7816, maxHitRange:3221, fuel:55, ammo:45, pctHealth:0.421, bleeding:0.3747, killerStation:'Keith', killerEntity:'Brian',},
                        { name:'Curtis', alliance:'opfor', fired:616, hits:82, wounds:71, kills:17, minHitRange:713, maxHitRange:3298, fuel:37, ammo:38, pctHealth:0.5702, bleeding:0.0794, killerStation:'Wayne', killerEntity:'May',},
                        { name:'Mitchell', alliance:'blufor', fired:793, hits:11, wounds:48, kills:24, minHitRange:5443, maxHitRange:3680, fuel:33, ammo:81, pctHealth:0.9232, bleeding:0.0899, killerStation:'Lois', killerEntity:'Florence',},
                        { name:'Herbert', alliance:'opfor', fired:815, hits:12, wounds:22, kills:21, minHitRange:7642, maxHitRange:4755, fuel:30, ammo:88, pctHealth:0.9711, bleeding:0.0063, killerStation:'Lida', killerEntity:'Kate',},
                        { name:'Mabelle', alliance:'blufor', fired:94, hits:96, wounds:65, kills:82, minHitRange:9519, maxHitRange:1586, fuel:1, ammo:15, pctHealth:0.1844, bleeding:0.3459, killerStation:'Anne', killerEntity:'Isaiah',},
                        { name:'Derek', alliance:'opfor', fired:969, hits:2, wounds:18, kills:82, minHitRange:1281, maxHitRange:1370, fuel:51, ammo:17, pctHealth:0.3813, bleeding:0.4435, killerStation:'Katherine', killerEntity:'Barbara',},
                        { name:'Don', alliance:'opfor', fired:643, hits:16, wounds:16, kills:61, minHitRange:8025, maxHitRange:3382, fuel:22, ammo:98, pctHealth:0.3579, bleeding:0.2515, killerStation:'Bill', killerEntity:'Randall',},
                        { name:'Lilly', alliance:'blufor', fired:765, hits:71, wounds:41, kills:22, minHitRange:85, maxHitRange:2604, fuel:91, ammo:42, pctHealth:0.744, bleeding:0.5087, killerStation:'Adelaide', killerEntity:'Daisy',},
                        { name:'Edward', alliance:'opfor', fired:361, hits:42, wounds:11, kills:87, minHitRange:8147, maxHitRange:4301, fuel:59, ammo:79, pctHealth:0.6338, bleeding:0.1182, killerStation:'Gregory', killerEntity:'Maud',},
                        { name:'Herbert', alliance:'blufor', fired:45, hits:90, wounds:62, kills:95, minHitRange:8775, maxHitRange:5424, fuel:33, ammo:89, pctHealth:0.5654, bleeding:0.7052, killerStation:'Hilda', killerEntity:'Helen',},
                        { name:'Lucile', alliance:'blufor', fired:212, hits:39, wounds:97, kills:93, minHitRange:2823, maxHitRange:3804, fuel:12, ammo:6, pctHealth:0.152, bleeding:0.3523, killerStation:'Alexander', killerEntity:'Herbert',},
                        { name:'Billy', alliance:'opfor', fired:872, hits:31, wounds:25, kills:11, minHitRange:2246, maxHitRange:6392, fuel:72, ammo:38, pctHealth:0.9703, bleeding:0.7313, killerStation:'Lora', killerEntity:'Jason',},
                        { name:'Alexander', alliance:'blufor', fired:213, hits:26, wounds:97, kills:52, minHitRange:8272, maxHitRange:1724, fuel:33, ammo:20, pctHealth:0.9828, bleeding:0.6668, killerStation:'Polly', killerEntity:'Rosie',},
                        { name:'Ralph', alliance:'opfor', fired:485, hits:91, wounds:32, kills:54, minHitRange:9224, maxHitRange:6912, fuel:97, ammo:82, pctHealth:0.1812, bleeding:0.0552, killerStation:'Russell', killerEntity:'Blake',},
                        { name:'Alex', alliance:'blufor', fired:713, hits:51, wounds:5, kills:42, minHitRange:6445, maxHitRange:5525, fuel:68, ammo:44, pctHealth:0.8453, bleeding:0.7634, killerStation:'Julian', killerEntity:'Richard',},
                        { name:'Caleb', alliance:'blufor', fired:821, hits:18, wounds:36, kills:46, minHitRange:248, maxHitRange:7775, fuel:80, ammo:70, pctHealth:0.7198, bleeding:0.7218, killerStation:'Ida', killerEntity:'Connor',},
                        { name:'Tillie', alliance:'opfor', fired:517, hits:85, wounds:61, kills:100, minHitRange:4189, maxHitRange:7807, fuel:25, ammo:10, pctHealth:0.1882, bleeding:0.2927, killerStation:'Grace', killerEntity:'Etta',},
                        { name:'Cordelia', alliance:'opfor', fired:605, hits:10, wounds:30, kills:91, minHitRange:7765, maxHitRange:9487, fuel:73, ammo:57, pctHealth:0.9511, bleeding:0.1773, killerStation:'Gregory', killerEntity:'Chad',},
                        { name:'Jean', alliance:'blufor', fired:549, hits:61, wounds:57, kills:100, minHitRange:6462, maxHitRange:5456, fuel:88, ammo:10, pctHealth:0.0669, bleeding:0.8122, killerStation:'Josephine', killerEntity:'Jay',},
                        { name:'Myrtle', alliance:'opfor', fired:837, hits:56, wounds:96, kills:28, minHitRange:6314, maxHitRange:7535, fuel:60, ammo:83, pctHealth:0.2663, bleeding:0.9243, killerStation:'Mollie', killerEntity:'Mario',},
                        { name:'Tommy', alliance:'blufor', fired:398, hits:15, wounds:49, kills:76, minHitRange:3698, maxHitRange:8374, fuel:71, ammo:47, pctHealth:0.051, bleeding:0.9661, killerStation:'Lelia', killerEntity:'Cornelia',},
                    ],
                },
            },
        };
    },
    computed:
    {
        languageID() {return this.$store.getters.language.id; },
    },
    methods:
    {
        _unitsTableSort(items, sortBy, sortDesc, /* locale, customSorters*/)
        {
            sortBy = sortBy[0];
            sortDesc = sortDesc[0];

            if(sortBy==='pctHealth')
            {
                items.sort((a,b)=>a[sortBy]-b[sortBy]);
            }
            else if(sortBy==='pctHit')
            {
                items.sort((a,b)=>
                {
                    const aVal = a.hits/a.fired;
                    const bVal = b.hits/b.fired;
                    return aVal > bVal ? 1 : -1;
                });
            }
            else if(sortBy==='avgHitRange')
            {
                items.sort((a,b)=>
                {
                    const aVal = (a.maxHitRange-a.minHitRange)/2;
                    const bVal = (b.maxHitRange-b.minHitRange)/2;
                    return aVal > bVal ? 1 : -1;
                });
            }
            else
            {
                items.sort((a,b)=>a[sortBy]>b[sortBy]?1:-1);
            }

            if(!sortDesc)
                items.reverse();

            return items;
        }
    }
};
</script>
