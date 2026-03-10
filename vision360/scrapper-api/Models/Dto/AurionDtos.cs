using System.Text.Json;
using System.Text.Json.Serialization;

namespace scrapperPlanning.Models.Dto;

public sealed class AurionEventDto
{
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

    [JsonPropertyName("start")]
    [JsonConverter(typeof(FlexibleLongConverter))]
    public long Start { get; init; }

    [JsonPropertyName("end")]
    [JsonConverter(typeof(FlexibleLongConverter))]
    public long End { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("className")]
    public string? ClassName { get; init; }

    public List<StudentDto> Students { get; set; } = new();
    public List<LecturerDto> Lecturers { get; set; } = new();
    public List<ResourceDto> Resources { get; set; } = new();
    public List<GroupDto> Groups { get; set; } = new();
    public List<CourseDto> Courses { get; set; } = new();
}

public sealed record StudentDto(string FirstName, string LastName);
public sealed record LecturerDto(string FirstName, string LastName);
public sealed record ResourceDto(string Code, string Label, string? Room);
public sealed record GroupDto(string Code, string Label);
public sealed record CourseDto(string Code, string Course, string Module);

public sealed class FlexibleLongConverter : JsonConverter<long>
{
    public override long Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetInt64();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var raw = reader.GetString();
            if (string.IsNullOrWhiteSpace(raw))
            {
                return 0;
            }

            if (long.TryParse(raw, out var parsed))
            {
                return parsed;
            }

            if (DateTimeOffset.TryParse(raw, out var dto))
            {
                return dto.ToUnixTimeMilliseconds();
            }
        }

        throw new JsonException($"Unsupported token for long: {reader.TokenType}");
    }

    public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions options) =>
        writer.WriteNumberValue(value);
}
