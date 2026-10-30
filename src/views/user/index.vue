<template>
  <div>
    <el-form :inline="true" label-width="80px">
    <el-form-item>
        <el-button-group>
            <el-button type="primary" :icon="Refresh" @click="refresh()">{{ textShow($t('refresh')) }}</el-button>
            <el-button type="primary" :icon="Plus" @click="openAddUser()" v-if="isAdmin">{{ textShow($t('add')) }}</el-button>
            <el-button type="primary" :icon="RefreshLeft" @click="copySelection=multipleSelection;patchButton=true;commonType=1;confirmVisible=true" v-if="isAdmin">{{ textShow($t('user.reset')) }}</el-button>
            <el-button type="primary" :icon="Scissor" @click="copySelection=multipleSelection;patchButton=true;quotaVisible=true" v-if="isAdmin">{{ textShow($t('user.limitData')) }}</el-button>
            <el-button type="danger" :icon="Delete" @click="copySelection=multipleSelection;patchButton=true;commonType=0;confirmVisible=true" v-if="isAdmin">{{ textShow($t('delete')) }}</el-button>
        </el-button-group>
    </el-form-item>
    <el-form-item>
        <el-button type="success" :icon="Download" @click="openDownload()">{{ textShow($t('download.entry')) }}</el-button>
    </el-form-item>
    </el-form>
    <el-card v-if="isAdmin" shadow="hover" class="node-card">
        <div class="node-card-head">
            <span>{{ $t('node.title') }}</span>
            <el-button type="primary" size="small" @click="openNodeEdit()">{{ $t('node.add') }}</el-button>
        </div>
        <el-table :data="nodes" size="small">
            <el-table-column prop="name" :label="$t('node.name')" min-width="100"></el-table-column>
            <el-table-column :label="$t('node.server')" min-width="160">
                <template #default="scope">{{ scope.row.server }}:{{ scope.row.port }}</template>
            </el-table-column>
            <el-table-column prop="panelUrl" :label="$t('node.panel')" min-width="180"></el-table-column>
            <el-table-column :label="$t('node.kind')" width="90">
                <template #default="scope">
                    <el-tag v-if="scope.row.local" size="small">{{ $t('node.local') }}</el-tag>
                    <el-tag v-else size="small" type="success">{{ $t('node.remote') }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column width="140" align="center">
                <template #default="scope">
                    <el-button type="primary" link @click="openNodeEdit(scope.row)">{{ $t('edit') }}</el-button>
                    <el-button v-if="!scope.row.local" type="danger" link @click="removeNode(scope.row)">{{ $t('delete') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <div v-else-if="myNodes.length" class="node-mine">
        {{ $t('node.mine') }}:
        <el-tag v-for="n in myNodes" :key="n.id" size="small" class="node-tag">{{ n.name }}</el-tag>
    </div>
    <el-table
    :data="dataList.filter(data => !search || data.Username.toLowerCase().includes(search.toLowerCase()))" :height="clientHeight" @selection-change="handleSelectionChange" class="tableShow">
        <el-table-column
        type="selection"
        width="55" v-if="isAdmin">
        </el-table-column>
        <el-table-column
        :label="$t('username')"
        prop="Username"
        >
        </el-table-column>
        <el-table-column
        :label="$t('password')"
        :formatter="passwordFormatter">
        </el-table-column>
        <el-table-column
        :label="$t('user.upload')"
        :formatter="uploadFormatter" :sort-method="uploadSort" sortable>
        </el-table-column>
        <el-table-column
        :label="$t('user.download')"
        :formatter="downloadFormatter" :sort-method="downloadSort" sortable>
        </el-table-column>
        <el-table-column
        :label="$t('user.total')"
        :formatter="totalFormatter" :sort-method="totalSort" sortable>
        </el-table-column>
        <el-table-column
        :label="$t('user.quota')"
        :formatter="quotaFormatter">
        </el-table-column>
        <el-table-column
        :label="$t('user.expiryDate')">
        <template #default="scope">
            <div v-if="scope.row.ExpiryDate === ''">{{ $t('user.unlimit') }}</div>
            <el-popover trigger="hover" placement="top" v-else>
            <p>{{ $t('user.remaining') }}: {{ calculateDay(scope.row.ExpiryDate) }}</p>
            <template #reference>
                <div class="name-wrapper">
                    <el-tag>{{ scope.row.ExpiryDate === '' ? $t('user.unlimit') : scope.row.ExpiryDate }}</el-tag>
                </div>
            </template>
            </el-popover>
        </template>
        </el-table-column>
        <el-table-column
        :label="$t('node.assign')"
        min-width="140">
        <template #default="scope">
            <el-tag v-for="n in nodesOf(scope.row)" :key="n.id" size="small" class="node-tag">{{ n.name }}</el-tag>
        </template>
        </el-table-column>
        <el-table-column
        width="170"
        align="center">
        <template #header>
            <el-input
                v-model="search"
                :placeholder="$t('user.search')" v-if="isAdmin"/>
            <div v-if="!isAdmin">{{ $t('user.operate') }}</div>
        </template>
        <template #default="scope">
            <el-dropdown v-if="isAdmin">
                <el-button type="primary" link style="margin-top:2.6px">
                    {{ $t('edit') }}
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="userItem=scope.row; patchButton=false; quotaVisible=true">{{ $t('user.limitData') }}</el-dropdown-item>
                        <el-dropdown-item @click="userItem=scope.row; commonType=1; patchButton=false; confirmVisible=true">{{ $t('user.reset') }}</el-dropdown-item>
                        <el-dropdown-item @click="userItem=scope.row; handelEditUser()">{{ $t('user.modifyUser') }}</el-dropdown-item>
                        <el-dropdown-item @click="userItem=scope.row; expiryShow=$t('user.setExpire'); expiryVisible=true" v-if="scope.row.ExpiryDate === ''">{{ $t('user.setExpire') }}</el-dropdown-item>
                        <div v-else>
                            <el-dropdown-item @click="userItem=scope.row; expiryShow=$t('user.editExpire'); expiryVisible=true">{{ $t('user.editExpire') }}</el-dropdown-item>
                            <el-dropdown-item @click="userItem=scope.row; cancelUserExpire()">{{ $t('user.cancelExpire') }}</el-dropdown-item>
                        </div>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-dropdown style="margin-left:5px">
                <el-button type="primary" link style="margin-top:2.6px">
                    {{ $t('share') }} 
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="userItem=scope.row;commonType=4;handleShare()">{{ $t('user.trojanShareLink') }}</el-dropdown-item>
                        <el-dropdown-item @click="userItem=scope.row;commonType=5;handleShare()">{{ $t('user.clashShareLink') }}</el-dropdown-item>
                        <el-dropdown-item @click="userItem=scope.row;handleClash()">{{ $t('user.importClash') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-button style="margin-left:5px;" v-if="isAdmin" type="primary" link
            @click="userItem=scope.row;commonType=0;patchButton=false;confirmVisible=true"
            >{{ $t('delete') }}</el-button>
        </template>
        </el-table-column>
    </el-table>
    <el-dialog :title="commonTitle"  v-model="userVisible" :width="dialogWidth">
        <el-input type="text" v-model="userInfo.username" :placeholder="$root.$t('user.inputUsername')" @keyup.enter="commonType === 2? handleAddUser(): handleUpdateUser()"/>
        <el-input type="text" v-model="userInfo.password" :placeholder="$root.$t('user.inputPassword')" @keyup.enter="commonType === 2? handleAddUser(): handleUpdateUser()"/>
        <div v-if="isAdmin" class="node-assign">
            <div class="node-assign-label">{{ $t('node.assign') }}</div>
            <el-checkbox-group v-model="userInfo.nodeIds">
                <el-checkbox v-for="n in nodes" :key="n.id" :label="n.id">{{ n.name }} ({{ n.server }}:{{ n.port }})</el-checkbox>
            </el-checkbox-group>
            <div class="node-tip">{{ $t('node.syncTip') }}</div>
        </div>
        <template #footer>
            <el-button @click="userVisible = false">{{ $root.$t('cancel') }}</el-button>
            <el-button type="primary" @click="commonType === 2? handleAddUser(): handleUpdateUser()">{{ $root.$t('ok') }}</el-button>
        </template>
    </el-dialog>
    <el-dialog :title="commonTitle"  v-model="confirmVisible" :width="dialogWidth">
        {{ editUser }}
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="confirmVisible = false;copySelection=[];">{{ $root.$t('cancel') }}</el-button>
                <el-button type="primary" @click="confirmVisible = false; patchButton ? handlePatchOpera(): handleOpera()">{{ $root.$t('ok') }}</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog :title="quotaText" v-model="quotaVisible" :width="dialogWidth">
        {{ editUser }}
        <el-divider v-if="editUser != ''"></el-divider>
        <el-tooltip effect="dark" :content="$t('user.meanUnlimit')" placement="top">
            <el-input-number v-model="quota" :min="-1" :precision="0"></el-input-number>
        </el-tooltip>
        <el-select v-model="quotaUnit" :placeholder="$t('choice')" style="margin-left: 5px; width:80px">
            <el-option
            v-for="item in quotaOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value">
            </el-option>
        </el-select>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="quotaVisible=false">{{ $root.$t('cancel') }}</el-button>
                <el-button type="primary" @click="quotaVisible=false; handleSetQuota()">{{ $root.$t('ok') }}</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog :title="commonTitle" v-model="qrcodeVisible" :width="shareDialogWidth" @close="closeQRCode">
        <div v-if="commonType === 4 && shareNodeList.length > 1" class="share-switch">
            <span>{{ $t('node.switchNode') }}</span>
            <el-select v-model="shareNodeId" style="width: 220px; margin-left: 8px" @change="onShareNodeChange">
                <el-option v-for="n in shareNodeList" :key="n.id" :label="n.name" :value="n.id"></el-option>
            </el-select>
        </div>
        <div id="qrcode" ref="qrcode" class="qrcodeCenter"></div>
        <p class="qrcodeCenter"> {{ shareLink }} </p>
        <div class="share-actions">
            <el-button size="small" @click="copyText(shareLink)">{{ commonType === 4 ? $t('node.copyOne') : $t('download.copy') }}</el-button>
            <el-button v-if="commonType === 4 && shareNodeList.length > 1" size="small" @click="copyText(allTrojanLinks)">{{ $t('node.copyAll') }}</el-button>
        </div>
        <div v-if="shareNodeList.length" class="share-nodes">
            <div class="node-tip">{{ commonType === 4 ? $t('node.allLinks') : $t('node.included') }}</div>
            <div v-for="n in shareNodeList" :key="n.id" class="share-node-line">{{ n.name }} · {{ n.server }}:{{ n.port }}</div>
        </div>
    </el-dialog>
    <el-dialog :title="$t('download.title')" v-model="downloadVisible" :width="dialogWidth">
        <el-radio-group v-model="curPlatform" size="small" style="margin-bottom: 15px;">
            <el-radio-button v-for="p in platformList" :key="p" :label="p">{{ platformLabels[p] }}</el-radio-button>
        </el-radio-group>
        <div v-for="item in clientData[curPlatform]" :key="item.key" class="client-card">
            <div class="client-info">
                <div class="client-name">{{ item.name }}</div>
                <div class="client-desc">{{ $t('download.desc.' + item.key) }}</div>
            </div>
            <el-button type="primary" size="small" @click="goDownload(item.url)">{{ $t('download.goDownload') }}</el-button>
        </div>
        <div v-if="subscribeUrl" class="subscribe-box">
            <el-divider>{{ $t('download.afterInstall') }}</el-divider>
            <div class="subscribe-tip">{{ $t('download.subscribeTip') }}</div>
            <el-input v-model="subscribeUrl" readonly size="small">
                <template #append>
                    <el-button @click="copySubscribe()">{{ $t('download.copy') }}</el-button>
                </template>
            </el-input>
            <el-button type="primary" size="small" style="margin-top: 10px;" @click="importClashFromDownload()">{{ $t('user.importClash') }}</el-button>
        </div>
    </el-dialog>
    <el-dialog :title="expiryShow" v-model="expiryVisible" :width="dialogWidth">
        <el-form>
            <el-form-item :label="$t('user.preset')">
                <el-select v-model="useDays" :placeholder="$t('choice')" filterable style="width: 130px;">
                    <el-option
                        v-for="item in expiryDateOptions"
                        :key="item.label"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('user.days')">
                <el-input-number v-model="useDays" :min=0></el-input-number>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="expiryVisible = false">{{ $root.$t('cancel') }}</el-button>
                <el-button type="primary" @click="expiryVisible=false; setUserExpire()">{{ $root.$t('ok') }}</el-button>
            </span>
        </template>
        </el-dialog>
    <el-dialog :title="nodeForm.id ? $t('node.edit') : $t('node.add')" v-model="nodeVisible" :width="shareDialogWidth">
        <el-form label-width="110px">
            <el-form-item :label="$t('node.name')">
                <el-input v-model="nodeForm.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('node.server')">
                <el-input v-model="nodeForm.server" :disabled="nodeForm.local"></el-input>
            </el-form-item>
            <el-form-item :label="$t('node.port')">
                <el-input-number v-model="nodeForm.port" :min="1" :max="65535" :disabled="nodeForm.local"></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('node.sni')">
                <el-input v-model="nodeForm.sni" :disabled="nodeForm.local" :placeholder="$t('node.sniHolder')"></el-input>
            </el-form-item>
            <template v-if="!nodeForm.local">
                <el-form-item :label="$t('node.panel')">
                    <el-input v-model="nodeForm.panelUrl" placeholder="https://example.com"></el-input>
                </el-form-item>
                <el-form-item :label="$t('node.adminPass')">
                    <el-input v-model="nodeForm.adminPass" type="password" show-password :placeholder="nodeForm.hasPassword ? $t('node.passKeep') : ''"></el-input>
                </el-form-item>
                <div class="node-tip">{{ $t('node.remoteTip') }}</div>
            </template>
            <div v-else class="node-tip">{{ $t('node.localTip') }}</div>
        </el-form>
        <template #footer>
            <el-button @click="nodeVisible = false">{{ $t('cancel') }}</el-button>
            <el-button type="primary" :loading="nodeSaving" @click="saveNodeForm()">{{ $t('ok') }}</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script>
import { userList, addUser, delUser, updateUser, setExpire, cancelExpire } from '@/api/user'
import { Refresh, Plus, RefreshLeft, Scissor, Delete, Download } from '@element-plus/icons-vue'
import { setQuota, cleanData } from '@/api/data'
import { setDomain, restart, saveNodes } from '@/api/trojan'
import { readablizeBytes, isValidIP, base64Encode, base64Decode } from '@/utils/common'
import { clients, platformList, platformLabels, detectPlatform } from '@/utils/clients'
import { mapState } from 'vuex'
import * as QRCode from 'easyqrcodejs'
import dayjs from 'dayjs'
import CryptoJS from 'crypto-js'
import { ElMessageBox } from 'element-plus'

export default {
    setup() {
        return {
            Refresh,
            Plus,
            RefreshLeft,
            Scissor,
            Delete,
            Download
        }
    },
    data() {
        return {
            search: '',
            domain: '',
            port: 0,
            shareLink: '',
            nodes: [],
            shareNodeList: [],
            shareNodeId: '',
            nodeVisible: false,
            nodeSaving: false,
            nodeForm: {
                id: '',
                name: '',
                server: '',
                port: 443,
                sni: '',
                panelUrl: '',
                adminPass: '',
                local: false,
                hasPassword: false
            },
            dataList: [],
            multipleSelection: [],
            copySelection: [],
            clientHeight: 0,
            userVisible: false,
            confirmVisible: false,
            quotaVisible: false,
            qrcodeVisible: false,
            expiryVisible: false,
            downloadVisible: false,
            curPlatform: detectPlatform(),
            clientData: clients,
            platformList: platformList,
            platformLabels: platformLabels,
            expiryShow: '',
            patchButton: false,
            // 确认框类型: 0 删除, 1 重置流量, 2 新增用户, 3 修改用户, 4 trojan链接, 5 clash链接
            commonType: 0,
            userItem: null,
            quota: -1,
            quotaUnit: 'MB',
            useDays: 7,
            quotaOptions: [
                {
                    value: 'MB'
                },
                {
                    value: 'GB'
                }
            ],
            expiryDateOptions: [
                {
                    label: this.$t('user.week'),
                    value: 7
                },
                {
                    label: this.$t('user.month'),
                    value: 30
                },
                {
                    label: this.$t('user.season'),
                    value: 90
                },
                {
                    label: this.$t('user.halfYear'),
                    value: 183
                },
                {
                    label: this.$t('user.year'),
                    value: 365
                }
            ],
            userInfo: {
                username: '',
                password: '',
                nodeIds: []
            }
        }
    },
    computed: {
        ...mapState(['dialogWidth', 'isAdmin']),
        shareDialogWidth: function() {
            return this.dialogWidth === '25%' ? '560px' : this.dialogWidth
        },
        myNodes: function() {
            if (this.isAdmin || this.dataList.length === 0) {
                return []
            }
            return this.nodesOf(this.dataList[0])
        },
        allTrojanLinks: function() {
            return this.shareNodeList.map(n => this.trojanURL(n)).join('\n')
        },
        subscribeUrl: function() {
            // 仅对普通用户(非admin)展示其本人的clash订阅链接
            if (this.isAdmin || this.dataList.length === 0) {
                return ''
            }
            const u = this.dataList[0]
            const userInfo = base64Encode(`{"user": "${u.Username}", "pass": "${base64Decode(u.Password)}"}`)
            const protocol = window.location.hostname === '127.0.0.1' ? 'https:' : window.location.protocol
            return `${protocol}//${this.domain}:${this.port}/trojan/user/subscribe?token=${userInfo}`
        },
        commonTitle: function() {
            let text = ''
            if (this.commonType === 4) {
                text = this.$t('user.trojanShareLink')
            } else if (this.commonType === 5) {
                text = this.$t('user.clashShareLink')
            } else if (this.commonType === 2) {
                text = this.$t('user.addUser')
            } else if (this.commonType === 3) {
                text = this.$t('user.modifyUser2') + this.userItem.Username + this.$t('user.userpass')
            } else if (this.commonType === 0) {
                if (this.patchButton) {
                    text = this.$t('user.patchDelUser')
                } else if (this.userItem !== null) {
                    text = this.$t('user.delUser') + this.userItem.Username + ' ?'
                }
            } else if (this.commonType === 1) {
                if (this.patchButton) {
                    text = this.$t('user.patchReset')
                } else if (this.userItem !== null) {
                    text = this.$t('user.resetUser') + this.userItem.Username + this.$t('user.data')
                }
            }
            return text
        },
        editUser: function() {
            if (this.patchButton) {
                let result = ''
                for (let i = 0; i < this.copySelection.length; i++) {
                    result += ', ' + this.copySelection[i].Username
                }
                return result.substring(1)
            } else {
                return ''
            }
        },
        quotaText: function() {
            if (this.patchButton) {
                return `${this.$t('user.patchLimitUser')}`
            } else {
                if (this.userItem !== null) {
                    return `${this.$t('user.limitUser')} ${this.userItem.Username} ${this.$t('user.data')}`
                } else {
                    return ''
                }
            }
        }
    },
    created() {
        this.refresh()
        this.clientHeight = document.body.clientHeight - 120
    },
    mounted() {
        window.onresize = () => {
            this.clientHeight = document.body.clientHeight - 120
        }
    },
    methods: {
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        passwordFormatter(row) {
            return base64Decode(row.Password)
        },
        quotaFormatter(row) {
            return row.Quota === -1 ? this.$t('user.unlimit') : readablizeBytes(row.Quota)
        },
        expiryFormatter(row) {
            return row.ExpiryDate === '' ? this.$t('user.unlimit') : row.ExpiryDate
        },
        uploadFormatter(row) {
            return readablizeBytes(row.Upload)
        },
        downloadFormatter(row) {
            return readablizeBytes(row.Download)
        },
        totalFormatter(row) {
            return readablizeBytes(row.Download + row.Upload)
        },
        uploadSort(a, b) {
            return a.Upload - b.Upload
        },
        downloadSort(a, b) {
            return a.Download - b.Download
        },
        totalSort(a, b) {
            return (a.Download + a.Upload) - (b.Download + b.Upload)
        },
        handleShare() {
            this.shareNodeList = this.nodesOf(this.userItem)
            this.shareNodeId = this.shareNodeList.length ? this.shareNodeList[0].id : ''
            if (this.commonType === 4) {
                this.shareLink = this.shareNodeList.length ? this.trojanURL(this.shareNodeList[0]) : ''
            } else if (this.commonType === 5) {
                const userInfo = base64Encode(`{"user": "${this.userItem.Username}", "pass": "${base64Decode(this.userItem.Password)}"}`)
                const protocol = `${window.location.hostname}` === '127.0.0.1' ? 'https:' : `${window.location.protocol}`
                this.shareLink = `${protocol}//${this.domain}:${this.port}/trojan/user/subscribe?token=${userInfo}`
            }
            this.qrcodeVisible = true
            this.$nextTick(() => {
                this.drawQR()
            })
        },
        onShareNodeChange() {
            const node = this.shareNodeList.find(n => n.id === this.shareNodeId)
            if (!node) {
                return
            }
            this.shareLink = this.trojanURL(node)
            this.drawQR()
        },
        drawQR() {
            if (!this.$refs.qrcode || !this.shareLink) {
                return
            }
            this.$refs.qrcode.innerHTML = ''
            // eslint-disable-next-line
            new QRCode(this.$refs.qrcode, {
                width: 200,
                height: 200,
                text: this.shareLink
            })
        },
        trojanURL(node) {
            const pass = encodeURIComponent(base64Decode(this.userItem.Password))
            const server = node.server
            const port = node.port
            const sni = node.sni || server
            const name = encodeURIComponent(node.name || `${server}:${port}`)
            let link = `trojan://${pass}@${server}:${port}`
            if (sni && sni !== server) {
                link += `?sni=${encodeURIComponent(sni)}`
            }
            return `${link}#${name}`
        },
        nodesOf(row) {
            if (!row) {
                return []
            }
            let ids = row.NodeIDs
            if (!ids || ids.length === 0) {
                ids = this.nodes.filter(n => n.local).map(n => n.id)
            }
            const list = this.nodes.filter(n => ids.indexOf(n.id) !== -1)
            if (list.length > 0) {
                return list
            }
            if (this.domain) {
                return [{ id: 'local', name: `${this.domain}:${this.port}`, server: this.domain, port: this.port, sni: this.domain, local: true }]
            }
            return []
        },
        defaultNodeIds() {
            const local = this.nodes.find(n => n.local)
            if (local) {
                return [local.id]
            }
            return this.nodes.length ? [this.nodes[0].id] : []
        },
        openAddUser() {
            this.commonType = 2
            this.userInfo.username = ''
            this.userInfo.password = ''
            this.userInfo.nodeIds = this.defaultNodeIds()
            this.userVisible = true
        },
        showSyncResult(result) {
            const sync = result && result.Data && result.Data.sync
            if (!Array.isArray(sync)) {
                return
            }
            const failed = sync.filter(item => !item.ok)
            if (failed.length === 0) {
                return
            }
            this.$message.warning(failed.map(item => `${item.name}: ${item.msg}`).join('；'))
        },
        copyText(text) {
            if (!text) {
                return
            }
            const done = () => this.$message({ message: this.$t('download.copySuccess'), type: 'success' })
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(() => {})
            } else {
                const input = document.createElement('textarea')
                input.value = text
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
                done()
            }
        },
        toNodePayload(node, plainPassword) {
            const payload = {
                id: node.id || '',
                name: (node.name || '').trim(),
                server: (node.server || '').trim(),
                port: Number(node.port) || 0,
                sni: (node.sni || '').trim(),
                panelUrl: (node.panelUrl || '').trim(),
                adminPass: '',
                local: !!node.local
            }
            if (plainPassword) {
                payload.adminPass = CryptoJS.SHA224(plainPassword).toString()
            }
            return payload
        },
        openNodeEdit(row) {
            if (row) {
                this.nodeForm = {
                    id: row.id,
                    name: row.name,
                    server: row.server,
                    port: row.port,
                    sni: row.sni || '',
                    panelUrl: row.panelUrl || '',
                    adminPass: '',
                    local: !!row.local,
                    hasPassword: !!row.hasPassword
                }
            } else {
                this.nodeForm = {
                    id: '',
                    name: '',
                    server: '',
                    port: 443,
                    sni: '',
                    panelUrl: '',
                    adminPass: '',
                    local: false,
                    hasPassword: false
                }
            }
            this.nodeVisible = true
        },
        async removeNode(row) {
            try {
                await ElMessageBox.confirm(this.$t('node.removeConfirm'), this.$t('delete'), { type: 'warning' })
            } catch (e) {
                return
            }
            const next = this.nodes.filter(n => n.id !== row.id).map(n => this.toNodePayload(n, ''))
            await this.submitNodes(next)
        },
        async saveNodeForm() {
            const form = this.nodeForm
            if (!form.name || !form.name.trim()) {
                this.$message.error(this.$t('node.nameRequired'))
                return
            }
            if (!form.local) {
                if (!form.server || !form.port) {
                    this.$message.error(this.$t('node.serverRequired'))
                    return
                }
                if (!form.panelUrl) {
                    this.$message.error(this.$t('node.panelRequired'))
                    return
                }
                if (!form.hasPassword && !form.adminPass) {
                    this.$message.error(this.$t('node.passRequired'))
                    return
                }
            }
            const next = this.nodes.map(n => {
                if (form.id && n.id === form.id) {
                    return this.toNodePayload(Object.assign({}, n, form), form.adminPass)
                }
                return this.toNodePayload(n, '')
            })
            if (!form.id) {
                next.push(this.toNodePayload(form, form.adminPass))
            }
            await this.submitNodes(next)
        },
        async submitNodes(nodes) {
            this.nodeSaving = true
            try {
                const result = await saveNodes({ nodes })
                if (result && result.Msg === 'success') {
                    this.$message({ message: this.$t('node.saveSuccess'), type: 'success' })
                    this.showSyncResult(result)
                    this.nodeVisible = false
                    if (result.Data && Array.isArray(result.Data.nodes)) {
                        this.nodes = result.Data.nodes
                    }
                    this.getUserList()
                } else if (result) {
                    this.$message.error(result.Msg || this.$t('request.requestError'))
                }
            } catch (e) {
                // 连接失败时请求拦截器已提示
            } finally {
                this.nodeSaving = false
            }
        },
        handleClash() {
            let userInfo = base64Encode(`{"user": "${this.userItem.Username}", "pass": "${base64Decode(this.userItem.Password)}"}`)
            let url = `${window.location.origin}/trojan/user/subscribe?token=${userInfo}`
            window.location.href = `clash://install-config?url=${url}`
        },
        openDownload() {
            this.curPlatform = detectPlatform()
            this.downloadVisible = true
        },
        goDownload(url) {
            window.open(url, '_blank')
        },
        copySubscribe() {
            const text = this.subscribeUrl
            const done = () => this.$message({ message: this.$t('download.copySuccess'), type: 'success' })
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(() => {})
            } else {
                const input = document.createElement('textarea')
                input.value = text
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
                done()
            }
        },
        importClashFromDownload() {
            if (this.dataList.length === 0) {
                return
            }
            const u = this.dataList[0]
            const userInfo = base64Encode(`{"user": "${u.Username}", "pass": "${base64Decode(u.Password)}"}`)
            const url = `${window.location.origin}/trojan/user/subscribe?token=${userInfo}`
            window.location.href = `clash://install-config?url=${url}`
        },
        handelEditUser() {
            this.userInfo.username = this.userItem.Username
            this.userInfo.password = base64Decode(this.userItem.Password)
            const ids = this.userItem.NodeIDs
            this.userInfo.nodeIds = ids && ids.length ? ids.slice() : this.defaultNodeIds()
            this.commonType = 3
            this.userVisible = true
        },
        textShow(text) {
            if (this.dialogWidth === '80%') {
                return ''
            } else {
                return text
            }
        },
        closeQRCode() {
            this.$refs.qrcode.innerHTML = ''
        },
        calculateDay(day) {
            return dayjs(day).diff(dayjs(dayjs().format('YYYY-MM-DD')), 'day')
        },
        async setUserExpire() {
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('useDays', this.useDays)
            const result = await setExpire(formData)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.setExpireSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.userItem = null
            this.refresh()
        },
        async cancelUserExpire() {
            const result = await cancelExpire(this.userItem.ID)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.cancelExpireSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.userItem = null
            this.refresh()
        },
        async requestQuota() {
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('quota', this.quota)
            const result = await setQuota(formData)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.limitUser2')} ${this.userItem.Username} ${this.$t('user.limitSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
        },
        async handleSetQuota() {
            if (this.quota !== -1) {
                if (this.quotaUnit === 'MB') {
                    this.quota = this.quota * 1024 * 1024
                } else if (this.quotaUnit === 'GB') {
                    this.quota = this.quota * 1024 * 1024 * 1024
                }
            }
            if (this.patchButton) {
                for (let i = 0; i < this.copySelection.length; i++) {
                    this.userItem = this.copySelection[i]
                    await this.requestQuota()
                }
            } else {
                await this.requestQuota()
            }
            this.userItem = null
            this.quota = 0
            this.refresh()
        },
        async handlePatchOpera() {
            let successText = ''
            let result = null
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', true)
            }
            for (let i = 0; i < this.copySelection.length; i++) {
                this.userItem = this.copySelection[i]
                if (this.commonType === 0) {
                    try {
                        result = await delUser(this.userItem.ID)
                    } catch {
                        result = { Msg: 'success' }
                    }
                    successText = `${this.$t('user.delUser1')}${this.userItem.Username}${this.$t('user.success')}`
                } else if (this.commonType === 1) {
                    result = await cleanData(this.userItem.ID)
                    successText = `${this.$t('user.resetUser1')}${this.userItem.Username}${this.$t('user.success')}`
                }
                if (result.Msg === 'success') {
                    this.$message({
                        message: successText,
                        type: 'success'
                    })
                    this.userItem = null
                } else {
                    this.$message.error(result.Msg)
                }
            }
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', false)
            }
            this.refresh()
        },
        async handleOpera() {
            let successText = ''
            let result = null
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', true)
                try {
                    result = await delUser(this.userItem.ID)
                } catch {
                    result = { Msg: 'success' }
                }
                this.$store.commit('SET_NOERROR', false)
                successText = `${this.$t('user.delUser1')}${this.userItem.Username}${this.$t('user.success')}`
            } else if (this.commonType === 1) {
                result = await cleanData(this.userItem.ID)
                successText = `${this.$t('user.resetUser1')}${this.userItem.Username}${this.$t('user.success')}`
            }
            if (result.Msg === 'success') {
                this.$message({
                    message: successText,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.refresh()
        },
        async handleUpdateUser() {
            if (this.userInfo.username === '' || this.userInfo.password === '') {
                this.$message.error(this.$t('inputNotNull'))
                return
            }
            if (this.userInfo.username === 'admin') {
                this.$message.error(this.$t('user.limitAdmin'))
                return
            }
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('username', this.userInfo.username)
            try {
                formData.set('password', base64Encode(this.userInfo.password))
            } catch (e) {
                this.$message.error(this.$t('user.passLimit'))
                return
            }
            if (this.isAdmin) {
                if (this.userInfo.nodeIds.length === 0) {
                    this.$message.error(this.$t('node.selectOne'))
                    return
                }
                formData.set('nodes', this.userInfo.nodeIds.join(','))
            }
            const result = await updateUser(formData)
            this.userVisible = false
            this.refresh()
            if (result.Msg === 'success') {
                this.showSyncResult(result)
                this.$message({
                    message: `${this.$t('user.modifyUser2')}${this.userInfo.username}${this.$t('user.success')}`,
                    type: 'success'
                })
                this.$store.commit('SET_NOERROR', true)
                try {
                    await restart().catch()
                } catch(e) {
                    this.$store.commit('SET_NOERROR', false)
                }
            } else {
                this.$message.error(result.Msg)
            }
        },
        async handleAddUser() {
            if (this.userInfo.username === '' || this.userInfo.password === '') {
                this.$message.error(this.$t('inputNotNull'))
                return
            }
            if (this.userInfo.username === 'admin') {
                this.$message.error(this.$t('user.limitAdmin'))
                return
            }
            if (this.isAdmin && this.userInfo.nodeIds.length === 0) {
                this.$message.error(this.$t('node.selectOne'))
                return
            }
            const formData = new FormData()
            formData.set('username', this.userInfo.username)
            try {
                formData.set('password', base64Encode(this.userInfo.password))
            } catch (e) {
                this.$message.error(this.$t('user.passLimit'))
                return
            }
            if (this.isAdmin) {
                formData.set('nodes', this.userInfo.nodeIds.join(','))
            }
            const result = await addUser(formData)
            if (result.Msg === 'success') {
                this.showSyncResult(result)
                this.$message({
                    message: `${this.$t('user.addUser2')}${this.userInfo.username}${this.$t('user.success')}`,
                    type: 'success'
                })
                this.userInfo.username = ''
                this.userInfo.password = ''
            } else {
                this.$message.error(result.Msg)
            }
            this.userVisible = false
            this.refresh()
        },
        refresh() {
            this.dataList = []
            this.domain = ''
            this.getUserList()
        },
        async getUserList() {
            const result = await userList()
            if (result.Msg === 'success') {
                if (result.Data.userList === null) {
                    this.dataList = []
                } else {
                    this.dataList = result.Data.userList
                }
                this.port = result.Data.port
                if (result.Data.domain !== '') {
                    this.domain = result.Data.domain
                } else {
                    const hostname = window.location.hostname
                    if (!isValidIP(hostname)) {
                        this.domain = hostname
                        const formData = new FormData()
                        formData.set('domain', this.domain)
                        this.$store.commit('SET_NPROGRESS', false)
                        this.$store.commit('SET_NOERROR', true)
                        try {
                            await setDomain(formData)
                        } catch (e) {
                            this.$store.commit('SET_NPROGRESS', true)
                            this.$store.commit('SET_NOERROR', false)
                        }
                    }
                }
                this.nodes = (result.Data.nodes || []).map((n) => {
                    if (n.local && !n.server && this.domain) {
                        return Object.assign({}, n, { server: this.domain, port: this.port || n.port, sni: this.domain })
                    }
                    return n
                })
            } else {
                this.$message.error(result.Msg)
            }
        }
    }
}
</script>

<style lang="scss">
.qrcodeCenter {
    margin: 0 auto;
    width: 200px;
    overflow-wrap: anywhere;
}
.tableShow {
    ::-webkit-scrollbar {
        display: none;
    }
    &:hover {
        ::-webkit-scrollbar {
            display: inline;
        }
    }
}
.client-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    margin-bottom: 8px;
    border: 1px solid var(--el-border-color, #dcdfe6);
    border-radius: 6px;
}
.client-card .client-name {
    font-weight: bold;
}
.client-card .client-desc {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
}
.subscribe-box {
    margin-top: 10px;
}
.subscribe-box .subscribe-tip {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
}
.node-card {
    margin-bottom: 12px;
}
.node-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: bold;
}
.node-tag {
    margin: 2px;
}
.node-mine {
    margin-bottom: 12px;
}
.node-assign {
    margin-top: 12px;
}
.node-assign-label {
    margin-bottom: 6px;
}
.node-tip {
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 8px;
}
.share-switch {
    margin-bottom: 12px;
}
.share-actions {
    text-align: center;
    margin-top: 8px;
}
.share-nodes {
    margin-top: 12px;
}
.share-node-line {
    font-size: 13px;
    line-height: 1.6;
}
</style>