<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\OrderController;
use App\Http\Controllers\PastDataController;
use App\Http\Controllers\APIController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/prev-sales', [OrderController::class, 'fetchSameWeekdayLastWeekSales']);

Route::get('/today-sales', [OrderController::class, 'fetchTodaySales']);

Route::get('/two-weeks', [PastDataController::class, 'groupOrdersByTimeBucket']);

Route::get('/yesterday-sales', [PastDataController::class, 'fetchYesterdaySales']);
Route::get('/last-week', [PastDataController::class, 'fetchSameWeekdayLastWeekSales']);

Route::get('/data-source', [APIController::class, 'data_source']);
Route::get('/predict-sales', [APIController::class, 'forecast']);