using rec_be;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Configurar CORS ANTES de cualquier cosa ──────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4201",
                "https://localhost:4200"
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
    });

builder.Services.AddOpenApi();

/*// PostgreSQL
builder.Services.AddDbContext<RACPostgreSQLDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention());

// ── Repositories ───────────────────────────────────────────────────
builder.Services.AddScoped<IRoomRepository,         PostgreSQLRoomRepository>();
builder.Services.AddScoped<IBookingRepository,      PostgreSQLBookingRepository>();
builder.Services.AddScoped<IGuestRepository,        PostgreSQLGuestRepository>();
builder.Services.AddScoped<IConfigRepository,       PostgreSQLConfigRepository>();
builder.Services.AddScoped<ILateCheckOutRepository, PostgreSQLLateCheckOutRepository>();

// ── Factory ───────────────────────────────────────────────────────
builder.Services.AddScoped<IRoomStrategyFactory, RoomStrategyFactory>();

// ── Services ───────────────────────────────────────────────────────
builder.Services.AddScoped<IBookingService,      BookingService>();
builder.Services.AddScoped<IRoomService,         RoomService>();
builder.Services.AddScoped<IGuestService,        GuestService>();
builder.Services.AddScoped<ILateCheckOutService, LateCheckOutService>();*/

var app = builder.Build();

// ── Usar CORS ANTES de los otros middlewares ─────────────────────
app.UseCors("AllowAngular");

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