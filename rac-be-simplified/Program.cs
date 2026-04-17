using Microsoft.EntityFrameworkCore;
using rec_be;
using rec_be.Data;
using rec_be.Interfaces.Factory;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Services;
using rec_be.Repository;
using rec_be.Room_FactoryStrategy.Factory;
using rec_be.Services;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Configurar CORS ANTES de cualquier cosa ──────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",   // Vite
                "http://localhost:5174",   // Vite (alternativo)
                "http://localhost:4200",   // Angular
                "http://localhost:4201"    // Angular
            )
            .AllowAnyMethod()              // GET, POST, PUT, DELETE, etc.
            .AllowAnyHeader()              // Content-Type, Authorization, etc.
            .AllowCredentials();           // Si usas cookies/autenticación
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
    });

builder.Services.AddOpenApi();

// PostgreSQL
builder.Services.AddDbContext<RACPostgreSQLDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention());

// ── Repositories ───────────────────────────────────────────────────
builder.Services.AddScoped<IRoomRepository,         PostgreSQLRoomRepository>();
builder.Services.AddScoped<IBookingRepository,      PostgreSQLBookingRepository>();
builder.Services.AddScoped<IGuestRepository,        PostgreSQLGuestRepository>();

// ── Factory ───────────────────────────────────────────────────────
builder.Services.AddScoped<IRoomStrategyFactory, RoomStrategyFactory>();

// ── Services ───────────────────────────────────────────────────────
builder.Services.AddScoped<IBookingService,      BookingService>();
builder.Services.AddScoped<IRoomService,         RoomService>();
builder.Services.AddScoped<IGuestService,        GuestService>();

var app = builder.Build();

// ── Usar CORS ANTES de los otros middlewares ─────────────────────
// ✅ IMPORTANTE: Usar el mismo nombre de la política que definiste
app.UseCors("AllowFrontend");  // ← Cambiado de "AllowAngular" a "AllowFrontend"

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Residencial Al Cubo Web API";
    });
}

// ── Comentar temporalmente para desarrollo ──────────────────────
// app.UseHttpsRedirection();

app.MapControllers();
app.Run();