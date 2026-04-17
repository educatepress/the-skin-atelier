"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleClient = getGoogleClient;
exports.getDriveClient = getDriveClient;
exports.getSheetsClient = getSheetsClient;
exports.downloadFileJSON = downloadFileJSON;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var googleapis_1 = require("googleapis");
var child_process_1 = require("child_process");
var readline = __importStar(require("readline"));
var dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });
var OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
var OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
var REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // Desktop app fallback
var OAUTH_TOKEN_PATH = path.join(process.cwd(), 'scripts', 'data', 'token.json');
var SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
];
function askQuestion(query) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(function (resolve) { return rl.question(query, function (ans) {
        rl.close();
        resolve(ans);
    }); });
}
function getGoogleClient() {
    return __awaiter(this, void 0, void 0, function () {
        var oAuth2Client, tokenData, authUrl, code, tokens, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
                        console.error('\n❌ GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET が .env に未設定です。');
                        process.exit(1);
                    }
                    oAuth2Client = new googleapis_1.google.auth.OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, REDIRECT_URI);
                    tokenData = null;
                    if (process.env.GOOGLE_OAUTH_TOKEN_JSON) {
                        try {
                            tokenData = JSON.parse(process.env.GOOGLE_OAUTH_TOKEN_JSON);
                        }
                        catch (e) {
                            console.error('Error parsing GOOGLE_OAUTH_TOKEN_JSON from env', e);
                        }
                    }
                    else if (fs.existsSync(OAUTH_TOKEN_PATH)) {
                        try {
                            tokenData = JSON.parse(fs.readFileSync(OAUTH_TOKEN_PATH, 'utf8'));
                        }
                        catch (e) {
                            console.error('Error reading token.json from file', e);
                        }
                    }
                    if (tokenData) {
                        try {
                            oAuth2Client.setCredentials(tokenData);
                            return [2 /*return*/, oAuth2Client];
                        }
                        catch (e) {
                            console.error('Error setting credentials, requiring re-auth.', e);
                        }
                    }
                    authUrl = oAuth2Client.generateAuthUrl({
                        access_type: 'offline',
                        prompt: 'consent',
                        scope: SCOPES,
                    });
                    console.log('\n🔐 【Google 認証が必要です (Drive & Sheets連携)】');
                    try {
                        (0, child_process_1.execSync)("open \"".concat(authUrl, "\""));
                        console.log('\n✅ ブラウザで認証ページを開きました。');
                    }
                    catch (_b) {
                        console.log('\n以下の URL をブラウザで手動で開いてください:');
                        console.log('\n' + authUrl + '\n');
                    }
                    console.log('\nGoogleでログインし、「アクセスを許可」した後、表示されたコードをコピーしてください。');
                    return [4 /*yield*/, askQuestion('👉 表示されたコードを貼り付けて Enter: ')];
                case 1:
                    code = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, oAuth2Client.getToken(code)];
                case 3:
                    tokens = (_a.sent()).tokens;
                    oAuth2Client.setCredentials(tokens);
                    if (!fs.existsSync(path.dirname(OAUTH_TOKEN_PATH))) {
                        fs.mkdirSync(path.dirname(OAUTH_TOKEN_PATH), { recursive: true });
                    }
                    fs.writeFileSync(OAUTH_TOKEN_PATH, JSON.stringify(tokens, null, 2));
                    console.log("\n\u2705 \u8A8D\u8A3C\u5B8C\u4E86\uFF01\u65B0\u3057\u304F\u30C8\u30FC\u30AF\u30F3\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\n");
                    return [2 /*return*/, oAuth2Client];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ 認証に失敗しました。コードが正しいか確認してください。', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getDriveClient() {
    return __awaiter(this, void 0, void 0, function () {
        var auth;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGoogleClient()];
                case 1:
                    auth = _a.sent();
                    return [2 /*return*/, googleapis_1.google.drive({ version: 'v3', auth: auth })];
            }
        });
    });
}
function getSheetsClient() {
    return __awaiter(this, void 0, void 0, function () {
        var auth;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGoogleClient()];
                case 1:
                    auth = _a.sent();
                    return [2 /*return*/, googleapis_1.google.sheets({ version: 'v4', auth: auth })];
            }
        });
    });
}
function downloadFileJSON(drive, fileId) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, drive.files.get({
                        fileId: fileId,
                        alt: 'media',
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.data];
            }
        });
    });
}
