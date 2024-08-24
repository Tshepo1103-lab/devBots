FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/app.Web.Host/app.Web.Host.csproj", "src/app.Web.Host/"]
COPY ["src/app.Web.Core/app.Web.Core.csproj", "src/app.Web.Core/"]
COPY ["src/app.Application/app.Application.csproj", "src/app.Application/"]
COPY ["src/app.Core/app.Core.csproj", "src/app.Core/"]
COPY ["src/app.EntityFrameworkCore/app.EntityFrameworkCore.csproj", "src/app.EntityFrameworkCore/"]
WORKDIR "/src/src/app.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/app.Web.Host", "src/app.Web.Host"]
COPY ["src/app.Web.Core", "src/app.Web.Core"]
COPY ["src/app.Application", "src/app.Application"]
COPY ["src/app.Core", "src/app.Core"]
COPY ["src/app.EntityFrameworkCore", "src/app.EntityFrameworkCore"]
WORKDIR "/src/src/app.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "app.Web.Host.dll"]
