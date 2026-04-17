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
exports.SheetsDB = exports.HEADERS = void 0;
var google_client_1 = require("./google-client");
var dotenv = __importStar(require("dotenv"));
var path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });
var SPREADSHEET_ID = process.env.GOOGLE_SHEETS_QUEUE_ID;
exports.HEADERS = [
    'content_id',
    'brand',
    'type',
    'title',
    'cloudinary_url', // CSV or JSON for carousels
    'cloudinary_public_id', // CSV or JSON for carousels
    'gdrive_url',
    'generation_recipe', // JSON string containing sourceDir, caption, etc.
    'status',
    'patrol_pre_result',
    'scheduled_date',
    'post_url',
    'posted_at',
    'patrol_post_result',
    'cloudinary_deleted',
    'slack_ts',
    'error_detail'
];
var SheetsDB = /** @class */ (function () {
    function SheetsDB() {
    }
    SheetsDB.getClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!SPREADSHEET_ID)
                            throw new Error('GOOGLE_SHEETS_QUEUE_ID is not set in .env');
                        return [4 /*yield*/, (0, google_client_1.getSheetsClient)()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // プロンプト設定を取得
    SheetsDB.getPrompts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, res, rows;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _b.sent();
                        return [4 /*yield*/, sheets.spreadsheets.values.get({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'prompts!A2:F'
                            }).catch(function (e) {
                                console.warn('⚠️ promptsシートが見つからないか、エラーが発生しました:', e.message);
                                return null;
                            })];
                    case 2:
                        res = _b.sent();
                        rows = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.values) || [];
                        return [2 /*return*/, rows.map(function (r) { return ({
                                brand: r[0] || '',
                                persona: r[1] || '',
                                target_audience: r[2] || '',
                                tone_and_style: r[3] || '',
                                cta_template: r[4] || '',
                                forbidden_rules: r[5] || ''
                            }); })];
                }
            });
        });
    };
    // 行データを取得
    SheetsDB.getRows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, res, rows;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _b.sent();
                        return [4 /*yield*/, sheets.spreadsheets.values.get({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'A2:Q'
                            }).catch(function () { return null; })];
                    case 2:
                        res = _b.sent();
                        rows = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.values) || [];
                        return [2 /*return*/, rows.map(function (row) {
                                var obj = {};
                                exports.HEADERS.forEach(function (header, index) {
                                    obj[header] = row[index] || '';
                                });
                                return obj;
                            })];
                }
            });
        });
    };
    // 新規行を追加
    SheetsDB.appendRows = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (rows.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _a.sent();
                        values = rows.map(function (row) {
                            return exports.HEADERS.map(function (header) { return row[header] || ''; });
                        });
                        return [4 /*yield*/, sheets.spreadsheets.values.append({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'A2:Q',
                                valueInputOption: 'USER_ENTERED',
                                requestBody: { values: values }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // content_idに基づいて行を更新
    SheetsDB.updateRow = function (content_id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, response, ids, rowIndex, actualRowNumber, dataToUpdate, _i, _a, key, colIndex, letter;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _b.sent();
                        return [4 /*yield*/, sheets.spreadsheets.values.get({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'A2:A'
                            })];
                    case 2:
                        response = _b.sent();
                        ids = response.data.values || [];
                        rowIndex = ids.findIndex(function (row) { return row[0] === content_id; });
                        if (rowIndex === -1) {
                            console.warn("content_id: ".concat(content_id, " not found in Sheets."));
                            return [2 /*return*/, false];
                        }
                        actualRowNumber = rowIndex + 2;
                        dataToUpdate = [];
                        for (_i = 0, _a = Object.keys(updates); _i < _a.length; _i++) {
                            key = _a[_i];
                            colIndex = exports.HEADERS.indexOf(key);
                            if (colIndex !== -1) {
                                letter = String.fromCharCode(65 + colIndex);
                                dataToUpdate.push({
                                    range: "".concat(letter).concat(actualRowNumber),
                                    values: [[updates[key]]]
                                });
                            }
                        }
                        if (!(dataToUpdate.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, sheets.spreadsheets.values.batchUpdate({
                                spreadsheetId: SPREADSHEET_ID,
                                requestBody: {
                                    valueInputOption: 'USER_ENTERED',
                                    data: dataToUpdate
                                }
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    // --- ThemeSchedule 関連のメソッド ---
    SheetsDB.getThemeSchedule = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, res, rows;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _b.sent();
                        return [4 /*yield*/, sheets.spreadsheets.values.get({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'ThemeSchedule!A2:I'
                            }).catch(function () { return null; })];
                    case 2:
                        res = _b.sent();
                        rows = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.values) || [];
                        return [2 /*return*/, rows.map(function (r) { return ({
                                date: r[0] || '',
                                brand: r[1] || '',
                                themeArea: r[2] || '',
                                theme: r[3] || '',
                                searchKeywords: r[4] || '',
                                referenceUrl: r[5] || '',
                                status: r[6] || '',
                                evidenceTier: r[7] || '',
                                limitations: r[8] || ''
                            }); })];
                }
            });
        });
    };
    SheetsDB.appendThemeSchedule = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (rows.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _a.sent();
                        values = rows.map(function (r) { return [
                            r.date, r.brand, r.themeArea, r.theme, r.searchKeywords, r.referenceUrl, r.status, r.evidenceTier || '', r.limitations || ''
                        ]; });
                        return [4 /*yield*/, sheets.spreadsheets.values.append({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'ThemeSchedule!A2:I',
                                valueInputOption: 'USER_ENTERED',
                                requestBody: { values: values }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SheetsDB.updateThemeScheduleStatus = function (theme, newStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var sheets, response, rows, rowIndex, actualRowNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        sheets = _a.sent();
                        return [4 /*yield*/, sheets.spreadsheets.values.get({
                                spreadsheetId: SPREADSHEET_ID,
                                range: 'ThemeSchedule!A2:G'
                            })];
                    case 2:
                        response = _a.sent();
                        rows = response.data.values || [];
                        rowIndex = rows.findIndex(function (row) { return row[3] === theme; });
                        if (rowIndex === -1) {
                            console.warn("Theme: ".concat(theme, " not found in ThemeSchedule."));
                            return [2 /*return*/, false];
                        }
                        actualRowNumber = rowIndex + 2;
                        return [4 /*yield*/, sheets.spreadsheets.values.update({
                                spreadsheetId: SPREADSHEET_ID,
                                range: "ThemeSchedule!G".concat(actualRowNumber),
                                valueInputOption: 'USER_ENTERED',
                                requestBody: { values: [[newStatus]] }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return SheetsDB;
}());
exports.SheetsDB = SheetsDB;
